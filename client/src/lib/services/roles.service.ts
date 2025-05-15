import request from "./api.service";

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const rolesService = {
  async getRoles(): Promise<Role[]> {
    const roles = await request<Role[]>("/roles");
    return roles;
  },

  async updateUserRole(roleId: number): Promise<void> {
    await request<void>("/auth/users/role", {
      method: "POST",
      data: { role_id: roleId },
    });
  },
};
