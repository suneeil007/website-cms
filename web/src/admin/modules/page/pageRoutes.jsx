
import { Routes, Route, Navigate } from "react-router-dom";

import PageListPage from "./pages/PageListPage";
import PageCreatePage from "./pages/PageCreatePage";
import PageEditPage from "./pages/PageEditPage";

export default function PageRoutes() {
    return (
        <Routes>
            <Route index element={<PageListPage />} />
            <Route path="create" element={<PageCreatePage />} />
            <Route path=":uuid/edit" element={<PageEditPage />} />
            <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
    );
}
