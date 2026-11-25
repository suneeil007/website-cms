import dashboardService from "./dashboard.service.js";

export async function getDashboard(req, res, next) {
    try {
        const dashboard =
            await dashboardService.getDashboardOverview();

        return res.status(200).json({
            success: true,
            message: "Dashboard data retrieved successfully.",
            data: dashboard,
        });
    } catch (error) {
        next(error);
    }
}