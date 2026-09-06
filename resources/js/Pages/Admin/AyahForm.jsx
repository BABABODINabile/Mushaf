import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, FormCard, Input, Textarea, Select, SubmittingButton, CancelLink } from '../../components/AdminUI';

export default function AyahForm({ ayah = null, surahs = [] }) {
    const { errors } = usePage().props;
    const isEdit = !!ayah;

    const [values, setValues] = useState({
        surah_id: ayah?.surah_id || '',
        number_in_surah: ayah?.number_in_surah || '',
        global_number: ayah?.global_number || '',
        text_ar: ayah?.text_ar || '',
        text_fr: ayah?.text_fr || '',
        text_en: ayah?.text_en || '',
        juz: ayah?.juz || '',
        page: ayah?.page || '',
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
            router.put(`/admin/ayahs/${ayah.id}`, values, { onFinish: () => setLoading(false) });
        } else {
            router.post('/admin/ayahs', values, { onFinish: () => setLoading(false) });
        }
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${isEdit ? 'Éditer' : 'Ajouter'} verset`} />

            <PageHeader
                title={isEdit ? `Éditer le verset n°${values.global_number}` : 'Ajouter un verset'}
                subtitle={isEdit ? 'Modifier les informations du verset' : 'Créer un nouveau verset'}
            />

            <FormCard>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        label="Sourate"
                        name="surah_id"
                        value={values.surah_id}
                        onChange={handleChange}
                        error={errors.surah_id}
                    >
                        <option value="">Choisir…</option>
                        {surahs.map((s) => (
                            <option key={s.id} value={s.id}>{s.number}. {s.name_fr}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="N° dans sourate"
                            type="number"
                            name="number_in_surah"
                            value={values.number_in_surah}
                            onChange={handleChange}
                            min="1"
                            error={errors.number_in_surah}
                        />
                        <Input
                            label="N° global"
                            type="number"
                            name="global_number"
                            value={values.global_number}
                            onChange={handleChange}
                            min="1"
                            error={errors.global_number}
                        />
                        <Input
                            label="Juz"
                            type="number"
                            name="juz"
                            value={values.juz}
                            onChange={handleChange}
                            min="1"
                            max="30"
                            error={errors.juz}
                        />
                    </div>

                    <Textarea
                        label="Texte arabe"
                        name="text_ar"
                        value={values.text_ar}
                        onChange={handleChange}
                        rows="3"
                        dir="rtl"
                        className="[&_textarea]:text-right [&_textarea]:text-lg"
                        error={errors.text_ar}
                    />

                    <Textarea
                        label="Traduction FR"
                        name="text_fr"
                        value={values.text_fr}
                        onChange={handleChange}
                        rows="3"
                        error={errors.text_fr}
                    />

                    <Textarea
                        label="Traduction EN"
                        name="text_en"
                        value={values.text_en}
                        onChange={handleChange}
                        rows="3"
                        error={errors.text_en}
                    />

                    <div className="mt-6 flex gap-3">
                        <SubmittingButton loading={loading} loadingText={isEdit ? 'Mise à jour…' : 'Création…'}>
                            {isEdit ? 'Mettre à jour' : 'Créer'}
                        </SubmittingButton>
                        <CancelLink href="/admin/ayahs" />
                    </div>
                </form>
            </FormCard>
        </AdminLayout>
    );
}
