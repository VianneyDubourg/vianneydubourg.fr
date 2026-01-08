"""
Base CRUD operations for routers
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Type, TypeVar, Generic
from app.database import get_db
from app.utils import get_or_404, update_model, delete_model

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")
ResponseSchemaType = TypeVar("ResponseSchemaType")


class CRUDRouter(Generic[ModelType, CreateSchemaType, UpdateSchemaType, ResponseSchemaType]):
    """Base CRUD router to reduce code duplication"""
    
    def __init__(
        self,
        model: Type[ModelType],
        create_schema: Type[CreateSchemaType],
        update_schema: Type[UpdateSchemaType],
        response_schema: Type[ResponseSchemaType],
        router: APIRouter,
        admin_only: bool = False,
        get_user_dependency = None
    ):
        self.model = model
        self.create_schema = create_schema
        self.update_schema = update_schema
        self.response_schema = response_schema
        self.router = router
        self.admin_only = admin_only
        self.get_user = get_user_dependency
        
        self._register_routes()
    
    def _register_routes(self):
        """Register CRUD routes"""
        # Get list
        @self.router.get("/", response_model=List[self.response_schema])
        async def get_items(
            skip: int = Query(0, ge=0),
            limit: int = Query(100, ge=1, le=500),
            db: Session = Depends(get_db)
        ):
            return db.query(self.model).offset(skip).limit(limit).all()
        
        # Get by ID
        @self.router.get("/{item_id}", response_model=self.response_schema)
        async def get_item(item_id: int, db: Session = Depends(get_db)):
            return get_or_404(db, self.model, item_id)
        
        # Create
        create_deps = [Depends(get_db)]
        if self.admin_only and self.get_user:
            create_deps.append(Depends(self.get_user))
        elif self.get_user:
            create_deps.append(Depends(self.get_user))
        
        @self.router.post("/", response_model=self.response_schema)
        async def create_item(
            item: self.create_schema,
            db: Session = Depends(get_db),
            **kwargs
        ):
            db_item = self.model(**item.dict())
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        
        # Update
        @self.router.put("/{item_id}", response_model=self.response_schema)
        async def update_item(
            item_id: int,
            item_update: self.update_schema,
            db: Session = Depends(get_db),
            **kwargs
        ):
            db_item = get_or_404(db, self.model, item_id)
            update_data = item_update.dict(exclude_unset=True)
            return update_model(db, db_item, update_data)
        
        # Delete
        delete_deps = [Depends(get_db)]
        if self.admin_only and self.get_user:
            delete_deps.append(Depends(self.get_user))
        
        @self.router.delete("/{item_id}")
        async def delete_item(
            item_id: int,
            db: Session = Depends(get_db),
            **kwargs
        ):
            db_item = get_or_404(db, self.model, item_id)
            return delete_model(db, db_item)
