import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Copy of data from constants.ts to avoid import issues during simple seeding
const ARTICLES = [
    {
        title: "Хаос на Курином Фестивале в Палето Бэй",
        excerpt: "Празднование дня домашней птицы закончилось погоней на тракторе и похищением трёх призовых несушек.",
        content: `<p><strong>ПАЛЕТО БЭЙ</strong> — 14-й Ежегодный Куриный Фестиваль Cluckin' Bell погрузился в анархию вчера днём...</p>`,
        author: "Рон Яковски",
        category: "Местные новости",
        slug: "chaos-at-chicken-festival",
        image: "https://picsum.photos/seed/chicken/800/400",
        status: "PUBLISHED"
    },
    {
        title: "Благотворительность 'Lost MC' вызывает подозрения",
        excerpt: "Печально известный мотоклуб утверждает, что собирает плюшевых мишек для сирот...",
        content: `<p><strong>СТЭБ СИТИ</strong> — Ежегодная благотворительная акция клуба Lost MC была остановлена...</p>`,
        author: "Патриция Мадрасо",
        category: "Криминал",
        slug: "lost-mc-charity-suspicion",
        image: "https://picsum.photos/seed/biker/600/400",
        status: "PUBLISHED"
    },
    {
        title: "Уровень воды в Аламо-Си падает, обнажая больше машин",
        excerpt: "Засуха раскрывает мутную историю страхового мошенничества в округе Блейн.",
        content: `<p><strong>СЭНДИ ШОРС</strong> — Отступающая вода в море Аламо обнажила крыши...</p>`,
        author: "Тревор Ф.",
        category: "Стиль жизни",
        slug: "alamo-sea-water-levels",
        image: "https://picsum.photos/seed/lake/600/400",
        status: "PUBLISHED"
    },
    {
        title: "Мнение: Почему ограничение скорости на Трассе 68 — это тирания",
        excerpt: "Наш редактор считает, что 55 миль в час — это рекомендация, а не закон.",
        content: `<p>Давайте будем честны. Никто не ездит 55 по Трассе 68...</p>`,
        author: "Джок Крэнли",
        category: "Мнение",
        slug: "route-68-speed-limit-tyranny",
        image: "https://picsum.photos/seed/road/600/400",
        status: "PUBLISHED"
    },
    {
        title: "Цены на мет стабилизировались после взрыва лаборатории",
        excerpt: "Аналитики рынка предполагают, что недавний «несчастный случай» на ранчо О'Нилов...",
        content: `<p><strong>ГРЕЙПСИД</strong> — Загадочный взрыв, сровнявший с землей фермерский дом...</p>`,
        author: "Шеф",
        category: "Бизнес и Мет",
        slug: "meth-prices-stabilize",
        image: "https://picsum.photos/seed/fire/600/400",
        status: "PUBLISHED"
    }
]

async function main() {
    // 1. Find or Create Admin User
    let admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        admin = await prisma.user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN',
                approved: true,
                displayName: 'Администратор',
            },
        })
        console.log('Created default admin user')
    } else {
        admin = await prisma.user.update({
            where: { id: admin.id },
            data: {
                approved: true,
                displayName: admin.displayName || 'Администратор'
            }
        })
        console.log(`Found and updated existing admin user: ${admin.username} (approved: true)`)
    }

    console.log({ admin })

    // 2. Create Articles
    for (const article of ARTICLES) {
        const { author, ...articleData } = article
        const createdArticle = await prisma.article.upsert({
            where: { slug: article.slug },
            update: {
                status: "PUBLISHED" // Update existing articles to PUBLISHED
            },
            create: {
                ...articleData,
                authorDisplay: author,
                authorId: admin.id,
            },
        })

        console.log(`Upserted article: ${createdArticle.title}`)
    }

    // 3. Create Ads
    const ADS = [
        {
            company: "Автодома от Ларри",
            tagline: "Дом там, где вы припарковались. Кредитная история не важна!",
            imageUrl: "https://picsum.photos/seed/rv/300/200",
            phone: "555-0192"
        },
        {
            company: "Бар «Желтый Джек»",
            tagline: "Приходи поиграть в дартс, оставайся ради драки.",
            imageUrl: "https://picsum.photos/seed/bar/300/200",
            phone: "555-0144"
        },
        {
            company: "Лос Сантос Кастомс (Хармони)",
            tagline: "Мы перекрасим, а вы скажете, что угнали.",
            imageUrl: "https://picsum.photos/seed/car/300/200",
            phone: "555-0188"
        }
    ];

    for (const ad of ADS) {
        const existing = await prisma.ad.findFirst({
            where: { company: ad.company }
        })
        if (!existing) {
            await prisma.ad.create({
                data: {
                    ...ad,
                    status: "PUBLISHED"
                }
            })
            console.log(`Created ad: ${ad.company}`)
        } else {
            console.log(`Ad already exists: ${ad.company}`)
        }
    }

    // 4. Create Categories
    const CATEGORIES = [
        { name: "Местные новости", slug: "local-news" },
        { name: "Криминал", slug: "crime" },
        { name: "Стиль жизни", slug: "lifestyle" },
        { name: "Мнение", slug: "opinion" },
        { name: "Бизнес и Мет", slug: "business-meth" }
    ];

    for (const category of CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category
        })
        console.log(`Upserted category: ${category.name}`)
    }

    // 5. Create Contacts
    const CONTACTS = [
        { name: "Molly Mercantile", phone: "480-7993", order: 1 },
        { name: "Crystal Waldorf", phone: "907-5076", order: 2 },
        { name: "Zach Waldorf", phone: "205-8357", order: 3 },
        { name: "Ashley Vesper", phone: "480-3383", order: 4 },
        { name: "Jean Pidieu", phone: "205-2075", order: 5 }
    ];

    for (const contact of CONTACTS) {
        await prisma.contact.upsert({
            where: { phone: contact.phone },
            update: contact,
            create: contact
        })
        console.log(`Upserted contact: ${contact.name}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
