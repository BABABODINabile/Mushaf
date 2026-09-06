import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, FormCard, Input, Textarea, SubmittingButton, CancelLink } from '../../components/AdminUI';

export default function CollectionForm({ collection = null }) {
    const { errors } = usePage().props;
    const isEdit = !!collection;

    const [values, setValues] = useState({
        slug: collection?.slug || '',
        name_ar: collection?.name_ar || '',
        name_en: collection?.name_en || '',
        description_en: collection?.description_en || '',
        total_hadiths: collection?.total_hadiths || '',
        is_authentic: collection?.is_authentic || false,
        sort_order: collection?.sort_order || 0,
    });

    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        if (isEdit) {
            router.put(`/admin/collections/${collection.id}`, values, { onFinish: () => setLoading(false) });
        } else {
            router.post('/admin/collections', values, { onFinish: () => setLoading(false) });
        }
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${isEdit ? 'Éditer' : 'Ajouter'} collection`} />

            <PageHeader
                title={isEdit ? `Éditer : ${collection.name_en}` : 'Ajouter une collection'}
                subtitle={isEdit ? 'Modifier les informations de la collection' : 'Créer une nouvelle collection'}
            />

            <FormCard className="max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Slug"
                        type="text"
                        name="slug"
                        value={values.slug}
                        onChange={handleChange}
                        placeholder="ex: an-nawawi"
                        error={errors.slug}
                    />

                    <Input
                        label="Nom arabe"
                        type="text"
                        name="name_ar"
                        value={values.name_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="text-right text-lg"
                        error={errors.name_ar}
                    />

                    <Input
                        label="Nom EN"
                        type="text"
                        name="name_en"
                        value={values.name_en}
                        onChange={handleChange}
                        error={errors.name_en}
                    />

                    <Textarea
                        label="Description EN"
                        name="description_en"
                        value={values.description_en}
                        onChange={handleChange}
                        rows="3"
                        error={errors.description_en}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Total hadiths"
                            type="number"
                            name="total_hadiths"
                            value={values.total_hadiths}
                            onChange={handleChange}
                            min="0"
                            error={errors.total_hadiths}
                        />
                        <Input
                            label="Ordre d'affichage"
                            type="number"
                            name="sort_order"
                            value={values.sort_order}
                            onChange={handleChange}
                            min="0"
                            error={errors.sort_order}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_authentic"
                            checked={values.is_authentic}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Collection authentique</label>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <SubmittingButton loading={loading} loadingText={isEdit ? 'Mise à jour…' : 'Création…'}>
                            {isEdit ? 'Mettre à jour' : 'Créer'}
                        </SubmittingButton>
                        <CancelLink href="/admin/collections" />
                    </div>
                </form>
            </FormCard>
        </AdminLayout>
    );
}
