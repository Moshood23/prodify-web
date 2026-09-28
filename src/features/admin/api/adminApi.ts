import apiClient from '../../../services/api/apiClient'
import type { PaginatedList } from '../../../types/catalog'
import type {
  AdminDashboard,
  AdminOrder,
  AdminOrderQuery,
  AdminOrderSummary,
  CustomerDetails,
  CustomerSummary,
  ManagedBrand,
  ManagedCategory,
  SellerDetails,
  SellerSummary,
} from '../../../types/admin'
import type { SellerStatus } from '../../../types/seller'

export interface SellerListQuery {
  status?: SellerStatus
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface CustomerListQuery {
  search?: string
  pageNumber?: number
  pageSize?: number
}

export type SellerAction = 'approve' | 'reject' | 'suspend' | 'reinstate'

export interface CategoryInput {
  name: string
  description?: string
  parentCategoryId?: string
}

export interface BrandInput {
  name: string
  description?: string
  logoUrl?: string
}

export const adminApi = {
  async getDashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard')
    return data
  },

  async getSellers(query: SellerListQuery): Promise<PaginatedList<SellerSummary>> {
    const { data } = await apiClient.get<PaginatedList<SellerSummary>>('/admin/sellers', { params: query })
    return data
  },

  async getSeller(id: string): Promise<SellerDetails> {
    const { data } = await apiClient.get<SellerDetails>(`/admin/sellers/${id}`)
    return data
  },

  // Reject and suspend need a reason; it is shown to the seller.
  async changeSellerStatus(id: string, action: SellerAction, reason?: string): Promise<void> {
    await apiClient.post(`/admin/sellers/${id}/${action}`, reason === undefined ? undefined : { reason })
  },

  async getOrders(query: AdminOrderQuery): Promise<PaginatedList<AdminOrderSummary>> {
    const { data } = await apiClient.get<PaginatedList<AdminOrderSummary>>('/admin/orders', { params: query })
    return data
  },

  async getOrder(id: string): Promise<AdminOrder> {
    const { data } = await apiClient.get<AdminOrder>(`/admin/orders/${id}`)
    return data
  },

  async getCustomers(query: CustomerListQuery): Promise<PaginatedList<CustomerSummary>> {
    const { data } = await apiClient.get<PaginatedList<CustomerSummary>>('/admin/customers', { params: query })
    return data
  },

  async getCustomer(id: string): Promise<CustomerDetails> {
    const { data } = await apiClient.get<CustomerDetails>(`/admin/customers/${id}`)
    return data
  },

  async getCategories(): Promise<ManagedCategory[]> {
    const { data } = await apiClient.get<ManagedCategory[]>('/categories/manage')
    return data
  },

  async createCategory(category: CategoryInput): Promise<string> {
    const { data } = await apiClient.post<string>('/categories', category)
    return data
  },

  async updateCategory(id: string, category: CategoryInput): Promise<void> {
    await apiClient.put(`/categories/${id}`, category)
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },

  async getBrands(): Promise<ManagedBrand[]> {
    const { data } = await apiClient.get<ManagedBrand[]>('/brands/manage')
    return data
  },

  async createBrand(brand: BrandInput): Promise<string> {
    const { data } = await apiClient.post<string>('/brands', brand)
    return data
  },

  async updateBrand(id: string, brand: BrandInput): Promise<void> {
    await apiClient.put(`/brands/${id}`, brand)
  },

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`)
  },
}