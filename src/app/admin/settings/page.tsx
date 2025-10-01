"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typography";
import { Container } from "@/components/ui/Container";
import CategoriesManager from "@/components/admin/CategoriesManager";
import NeighborhoodsManager from "@/components/admin/NeighborhoodsManager";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "neighborhoods">("categories");

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl font-bold text-gray-900">
          Настройки
        </Typography>
        <Typography variant="p" className="text-gray-600 mt-2">
          Управление на категории и квартали
        </Typography>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Категории
            </button>
            <button
              onClick={() => setActiveTab("neighborhoods")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "neighborhoods"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Квартали
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "categories" && (
          <Card className="p-6">
            <CategoriesManager />
          </Card>
        )}
        
        {activeTab === "neighborhoods" && (
          <Card className="p-6">
            <NeighborhoodsManager />
          </Card>
        )}
      </div>
    </Container>
  );
}
