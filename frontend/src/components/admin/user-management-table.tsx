"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import type { User } from "@/types";

interface UserManagementTableProps {
  token?: string;
}

type SortField = "username" | "email" | "role" | "sustainability_score" | "created_at";
type SortDirection = "asc" | "desc";

export function UserManagementTable({ token }: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<User[]>("/admin/users", token);
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "username":
          aVal = a.username;
          bVal = b.username;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "role":
          aVal = a.role;
          bVal = b.role;
          break;
        case "sustainability_score":
          aVal = a.sustainability_score;
          bVal = b.sustainability_score;
          break;
        case "created_at":
          aVal = a.created_at;
          bVal = b.created_at;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [users, search, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-white" />
    ) : (
      <ArrowDown className="h-3 w-3 text-white" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "moderator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={fetchUsers} className="text-xs text-blue-400 hover:text-blue-300">
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-blue-400" />
              User Management
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-white/10 bg-white/5 pl-9 text-white placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {(
                    [
                      { field: "username" as SortField, label: "Name" },
                      { field: "email" as SortField, label: "Email" },
                      { field: "role" as SortField, label: "Role" },
                      { field: "sustainability_score" as SortField, label: "Score" },
                      { field: "created_at" as SortField, label: "Joined" },
                    ] as const
                  ).map(({ field, label }) => (
                    <th
                      key={field}
                      className="cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-white"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-1.5">
                        {label}
                        <SortIcon field={field} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-xs font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {user.full_name || user.username}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-medium", getRoleBadgeColor(user.role))}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                        {user.sustainability_score}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-medium", getStatusBadgeColor(user.is_active))}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
