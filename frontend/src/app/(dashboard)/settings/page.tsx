"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/providers/AuthProvider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Moon, Sun } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, tokens, refreshUser } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const updateProfile = async () => {
    if (!tokens) return;
    setSaving(true);
    try {
      await api.patch("/users/me", { full_name: fullName, username }, tokens.access_token);
      await refreshUser();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!tokens || !oldPassword || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      }, tokens.access_token);
      setOldPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (err: any) {
      toast.error(err.detail || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} aria-required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <Button onClick={updateProfile} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look of CarbonVerse AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password regularly for security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} aria-required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password (min 6 characters)</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} aria-required minLength={6} />
          </div>
          <Button onClick={changePassword} disabled={saving || !oldPassword || !newPassword} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
