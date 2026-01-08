"""
Script d'initialisation de la base de données avec des données de démo
"""
from app.database import SessionLocal, engine, Base
from app.models import User, Article, Spot, Newsletter, ArticleStatus, SpotCategory
from app.routers.auth import get_password_hash
from datetime import datetime

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create admin user
    admin_user = User(
        username="admin",
        email="admin@lumiere.fr",
        hashed_password=get_password_hash("admin123"),
        full_name="Administrateur",
        is_admin=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print("✓ Admin user created (username: admin, password: admin123)")

    # Create demo user
    demo_user = User(
        username="demo",
        email="demo@lumiere.fr",
        hashed_password=get_password_hash("demo123"),
        full_name="Utilisateur Démo"
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    print("✓ Demo user created (username: demo, password: demo123)")

    # Create demo articles
    articles_data = [
        {
            "title": "À la poursuite des aurores boréales : Guide complet de l'Islande",
            "slug": "aurores-boreales-islande",
            "excerpt": "L'équipement nécessaire, les meilleurs spots loin de la foule et comment configurer votre boîtier pour capturer la magie verte.",
            "content": "Contenu complet de l'article sur les aurores boréales en Islande...",
            "cover_image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "category": "Paysage",
            "status": ArticleStatus.PUBLISHED,
            "reading_time": 5,
            "published_at": datetime(2023, 10, 12)
        },
        {
            "title": "Tokyo argentique : Redécouvrir la métropole en 35mm",
            "slug": "tokyo-argentique-35mm",
            "excerpt": "Une semaine dans les rues de Shinjuku et Shibuya avec seulement un Leica M6 et quelques rouleaux de Portra 400.",
            "content": "Contenu complet de l'article sur Tokyo en argentique...",
            "cover_image": "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "category": "Urbain",
            "status": ArticleStatus.PUBLISHED,
            "reading_time": 8,
            "published_at": datetime(2023, 9, 28)
        },
        {
            "title": "Slow Travel : L'art de prendre son temps",
            "slug": "slow-travel-art-temps",
            "excerpt": "Pourquoi j'ai décidé de ne plus courir après les \"must-see\" et comment cela a transformé ma photographie.",
            "content": "Contenu complet de l'article sur le slow travel...",
            "cover_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "category": "Lifestyle",
            "status": ArticleStatus.PUBLISHED,
            "reading_time": 3,
            "published_at": datetime(2023, 9, 15)
        }
    ]

    for article_data in articles_data:
        article = Article(
            **article_data,
            author_id=admin_user.id,
            views=0
        )
        db.add(article)
    db.commit()
    print("✓ Demo articles created")

    # Create demo spots
    spots_data = [
        {
            "name": "Lac de Braies",
            "description": "Un des plus beaux lacs des Dolomites, parfait pour les photos de lever de soleil.",
            "location": "Dolomites, Italie",
            "latitude": 46.6944,
            "longitude": 12.0847,
            "category": SpotCategory.NATURE,
            "image_url": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            "rating": 4.9,
            "tags": "Lever de soleil,Trépied",
            "best_time": "Lever de soleil",
            "equipment_needed": "Trépied"
        },
        {
            "name": "Shibuya Crossing",
            "description": "Le célèbre carrefour de Shibuya, idéal pour la photographie de rue nocturne.",
            "location": "Tokyo, Japon",
            "latitude": 35.6598,
            "longitude": 139.7006,
            "category": SpotCategory.URBAN,
            "image_url": "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            "rating": 4.7,
            "tags": "Nuit,Street",
            "best_time": "Nuit",
            "equipment_needed": "Objectif grand angle"
        }
    ]

    for spot_data in spots_data:
        spot = Spot(**spot_data)
        db.add(spot)
    db.commit()
    print("✓ Demo spots created")

    # Create demo newsletter subscriptions
    newsletter_emails = [
        "subscriber1@example.com",
        "subscriber2@example.com"
    ]
    for email in newsletter_emails:
        newsletter = Newsletter(email=email, is_active=True)
        db.add(newsletter)
    db.commit()
    print("✓ Demo newsletter subscriptions created")

    print("\n✅ Database initialized successfully!")
    print("\nYou can now start the server with: python backend/run.py")

except Exception as e:
    print(f"❌ Error initializing database: {e}")
    db.rollback()
finally:
    db.close()
