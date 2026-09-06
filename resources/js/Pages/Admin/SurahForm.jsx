import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, FormCard, Input, Select, SubmittingButton, CancelLink } from '../../components/AdminUI';

export default function SurahForm({ surah = null }) {
    const { errors } = usePage().props;
    const isEdit = !!surah;

    const [values, setValues] = useState({
        number: surah?.number || '',
        name_ar: surah?.name_ar || '',
        name_en: surah?.name_en || '',
        name_fr: surah?.name_fr || '',
        revelation_type: surah?.revelation_type || 'Meccan',
        ayah_count: surah?.ayah_count || '',
    });

    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        if (isEdit) {
            router.put(`/admin/surahs/${surah.id}`, values, { onFinish: () => setLoading(false) });
        } else {
            router.post('/admin/surahs', values, { onFinish: () => setLoading(false) });
        }
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${isEdit ? 'Éditer' : 'Ajouter'} sourate`} />

            <PageHeader
                title={isEdit ? `Éditer : ${surah.name_fr}` : 'Ajouter une sourate'}
                subtitle={isEdit ? 'Modifier les informations de la sourate' : 'Créer une nouvelle sourate'}
            />

            <FormCard>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Numéro"
                        type="number"
                        name="number"
                        value={values.number}
                        onChange={handleChange}
                        min="1"
                        max="114"
                        error={errors.number}
                    />

                    <Input
                        label="Nom arabe"
                        type="text"
                        name="name_ar"
                        value={values.name_ar}
                        onChange={handleChange}
                        error={errors.name_ar}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nom FR"
                            type="text"
                            name="name_fr"
                            value={values.name_fr}
                            onChange={handleChange}
                            error={errors.name_fr}
                        />
                        <Input
                            label="Nom EN"
                            type="text"
                            name="name_en"
                            value={values.name_en}
                            onChange={handleChange}
                            error={errors.name_en}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type de révélation"
                            name="revelation_type"
                            value={values.revelation_type}
                            onChange={handleChange}
                            error={errors.revelation_type}
                        >
                            <option value="Meccan">Meccan</option>
                            <option value="Medinan">Medinan</option>
                        </Select>

                        <Input
                            label="Nombre de versets"
                            type="number"
                            name="ayah_count"
                            value={values.ayah_count}
                            onChange={handleChange}
                            min="1"
                            error={errors.ayah_count}
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <SubmittingButton loading={loading} loadingText={isEdit ? 'Mise à jour…' : 'Création…'}>
                            {isEdit ? 'Mettre à jour' : 'Créer'}
                        </SubmittingButton>
                        <CancelLink href="/admin/surahs" />
                    </div>
                </form>
            </FormCard>
        </AdminLayout>
    );
}
