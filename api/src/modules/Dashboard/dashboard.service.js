
import prisma from "../../core/database/prisma.js";

const MONTHS_TO_DISPLAY = 6;
const RECENT_ACTIVITY_LIMIT = 8;

function getMonthKey(date) {
    return `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
    ).padStart(2, "0")}`;
}

function getMonthLabel(date) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

/**
 * Dashboard statistics
 */
async function getStatistics() {
    const [
        publishedPages,
        newsArticles,
        categories,
        mediaFiles,
        administrators,
    ] = await Promise.all([
        prisma.page.count({
            where: { status: "PUBLISHED" },
        }),

        prisma.news.count(),

        prisma.category.count(),

        prisma.media.count(),

        prisma.user.count(),
    ]);

    return {
        publishedPages,
        newsArticles,
        categories,
        mediaFiles,
        administrators,
    };
}

/**
 * Recent content activity
 *
 * Based on creation dates because the current
 * database does not have an activity log table.
 */
async function getRecentActivity() {
    const [pages, news, categories, media] = await Promise.all([
        prisma.page.findMany({
            orderBy: { createdAt: "desc" },
            take: RECENT_ACTIVITY_LIMIT,
            select: {
                uuid: true,
                title: true,
                createdAt: true,
                status: true,
            },
        }),

        prisma.news.findMany({
            orderBy: { createdAt: "desc" },
            take: RECENT_ACTIVITY_LIMIT,
            select: {
                uuid: true,
                title: true,
                createdAt: true,
                status: true,
            },
        }),

        prisma.category.findMany({
            orderBy: { createdAt: "desc" },
            take: RECENT_ACTIVITY_LIMIT,
            select: {
                uuid: true,
                name: true,
                createdAt: true,
                module: true,
            },
        }),

        prisma.media.findMany({
            orderBy: { createdAt: "desc" },
            take: RECENT_ACTIVITY_LIMIT,
            select: {
                uuid: true,
                originalName: true,
                createdAt: true,
            },
        }),
    ]);

    const activities = [
        ...pages.map((item) => ({
            id: item.uuid,
            type: "page",
            title: "Page created",
            description: `${item.title} was created`,
            status: item.status,
            createdAt: item.createdAt,
        })),

        ...news.map((item) => ({
            id: item.uuid,
            type: "news",
            title: "News article created",
            description: `${item.title} was created`,
            status: item.status,
            createdAt: item.createdAt,
        })),

        ...categories.map((item) => ({
            id: item.uuid,
            type: "category",
            title: "Category created",
            description: `${item.name} category was created`,
            module: item.module,
            createdAt: item.createdAt,
        })),

        ...media.map((item) => ({
            id: item.uuid,
            type: "media",
            title: "Media uploaded",
            description: `${item.originalName} was uploaded`,
            createdAt: item.createdAt,
        })),
    ];

    return activities
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, RECENT_ACTIVITY_LIMIT);
}

/**
 * Six-month publication chart
 */
async function getPublicationChart() {
    const now = new Date();

    const startDate = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() - (MONTHS_TO_DISPLAY - 1),
            1
        )
    );

    const months = Array.from(
        { length: MONTHS_TO_DISPLAY },
        (_, index) => {
            const date = new Date(
                Date.UTC(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth() + index,
                    1
                )
            );

            return {
                key: getMonthKey(date),
                month: getMonthLabel(date),
                pages: 0,
                news: 0,
                total: 0,
            };
        }
    );

    const monthMap = new Map(
        months.map((month) => [month.key, month])
    );

    const [pages, news] = await Promise.all([
        prisma.page.findMany({
            where: {
                status: "PUBLISHED",
                publishedAt: {
                    gte: startDate,
                    lte: now,
                },
            },
            select: {
                publishedAt: true,
            },
        }),

        prisma.news.findMany({
            where: {
                status: "PUBLISHED",
                publishedAt: {
                    gte: startDate,
                    lte: now,
                },
            },
            select: {
                publishedAt: true,
            },
        }),
    ]);

    pages.forEach(({ publishedAt }) => {
        if (!publishedAt) return;

        const month = monthMap.get(getMonthKey(publishedAt));

        if (month) {
            month.pages += 1;
            month.total += 1;
        }
    });

    news.forEach(({ publishedAt }) => {
        if (!publishedAt) return;

        const month = monthMap.get(getMonthKey(publishedAt));

        if (month) {
            month.news += 1;
            month.total += 1;
        }
    });

    return months.map(({ key, ...month }) => month);
}

/**
 * Complete dashboard overview
 */
async function getDashboardOverview() {
    const [statistics, recentActivity, publicationChart] =
        await Promise.all([
            getStatistics(),
            getRecentActivity(),
            getPublicationChart(),
        ]);

    return {
        statistics,
        recentActivity,
        publicationChart,
    };
}

export default {
    getDashboardOverview,
};
