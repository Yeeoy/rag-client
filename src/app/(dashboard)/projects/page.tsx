"use client";

import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import toast, { Toast } from "react-hot-toast";

interface Project{
    id: string
    name: string
    description: string
    created_at: string
    clerk_id : string
}

function ProjectsPage() {
    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const { getToken, userId } = useAuth();
    const router = useRouter();

    // Business logic functions

    const loadProjects = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const result = await apiClient.get("/api/projects", token);
            const { data } = result || {};
            console.log(data, "ProjectList");
            setProjects(data);
        } catch (err) {
            console.error("Error Loading Projects", err);
            toast.error("Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (name: string, description: string) => {
        try {
            setError(null);
            setIsCreating(true);
            const token = await getToken();
            const result = await apiClient.post(
                "/api/projects",
                {
                    name,
                    description,
                },
                token
            );
            const savedProject = result?.data || {};
            setProjects((prev) => [savedProject, ...prev]);
            setShowCreateModal(false);
            toast.success("Project created successfully!");
        } catch (err) {
            console.log("Failed to create project", err);
            toast.error("Failed to create project");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            setError(null);
            const token = await getToken();
            const result = await apiClient.delete(
                `/api/projects/${projectId}`,
                token
            );
            setProjects((prev) =>
                prev.filter((project) => project.id !== projectId)
            );
            toast.success("Project deleted successfully!");
        } catch (err) {
            console.log("Failed to delete project", err);
            toast.error("Failed to delete project");
        }
    };

    const handleProjectClick = (projectId: string) => {
        router.push(`projects/${projectId}`);
    };

    const handleOpenModal = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    useEffect(() => {
        if (userId) {
            loadProjects();
        }
    }, [userId]);

    const filteredProjects = projects.filter(
        (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (loading) {
        return <LoadingSpinner message="Loading projects..." />;
    }

    return (
        <div>
            <ProjectsGrid
                projects={filteredProjects}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                viewMode={viewMode}
                onSearchChange={setSearchQuery}
                onViewModeChange={setViewMode}
                onProjectClick={handleProjectClick}
                onCreateProject={handleOpenModal}
                onDeleteProject={handleDeleteProject}
            />

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={handleCloseModal}
                onCreateProject={handleCreateProject}
                isLoading={loading}
            />
        </div>
    );
}

export default ProjectsPage;
