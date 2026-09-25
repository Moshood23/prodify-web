import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sellerApi } from '../api/sellerApi'
import { reapplySchema, type ReapplyFormValues } from '../validation/sellerApplication.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { TextArea } from '../../../components/ui/TextArea'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'
import type { SellerProfile } from '../../../types/seller'

export function ReapplyForm({ seller }: { seller: SellerProfile }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReapplyFormValues>({
    resolver: zodResolver(reapplySchema),
    mode: 'onTouched',
    defaultValues: {
      businessName: seller.businessName,
      phoneNumber: seller.phoneNumber ?? '',
      description: seller.description ?? '',
    },
  })

  const reapply = useMutation({
    mutationFn: (values: ReapplyFormValues) => sellerApi.reapply({ ...values, description: values.description || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'me'] }),
  })

  return (
    <form onSubmit={handleSubmit((values) => reapply.mutate(values))} noValidate className="space-y-4">
      {reapply.error && <ErrorAlert>{getErrorMessage(reapply.error, 'Could not send your application.')}</ErrorAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Business name" error={errors.businessName?.message} {...register('businessName')} />
        <TextField label="Phone number" type="tel" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      </div>
      <TextArea label="What do you sell?" error={errors.description?.message} {...register('description')} />
      <Button type="submit" isLoading={reapply.isPending}>
        Send application again
      </Button>
    </form>
  )
}