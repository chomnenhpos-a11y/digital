import React from 'react';
import Swal from 'sweetalert2';
import { HiTrash } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

export default function DeleteButton({ onConfirm, className = "" }) {
    const { t } = useTranslation();

    const handleTriggerDelete = async () => {
        Swal.fire({
            title: t('common.areYouSure'),
            text: t('common.deletePermanently'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: t('common.yesDelete'),
            cancelButtonText: t('common.cancel'),
            reverseButtons: true
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                await onConfirm?.();
            } catch (error) {
                Swal.fire({
                    title: t('common.deleteFailed'),
                    text: error?.message || t('common.deleteErrorDesc'),
                    icon: 'error'
                });
            }
        });
    };

    return (
        <button
            onClick={handleTriggerDelete}
            className={`text-red-600 hover:text-red-900 transition-colors ${className}`}
            title={t('common.deleteItem')}
        >
            <HiTrash className="h-4 w-4" />
        </button>
    );
}