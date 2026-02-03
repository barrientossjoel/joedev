
import { useJourney } from "@/hooks/use-db-data";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
    const { t } = useTranslation();
    const { data: journey, loading } = useJourney();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mb-8">{t("dashboard.welcome")}</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="text-sm font-medium text-muted-foreground">{t("dashboard.stats.journey")}</div>
                    <div className="text-2xl font-bold mt-2">{loading ? "..." : journey.length}</div>
                </div>
                {/* Add more stats here later */}
            </div>
        </div>
    );
};

export default Dashboard;
