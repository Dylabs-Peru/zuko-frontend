export interface CreateRoleRequest{
    roleName: string; 
    description: string; 
}

export interface RoleResponse {
    id: number;
    roleName: string;
    description: string;
}