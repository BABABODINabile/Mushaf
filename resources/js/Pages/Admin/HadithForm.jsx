import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, FormCard, Input, Textarea, SubmittingButton, CancelLink } from '../../components/AdminUI';

export default function HadithForm({ hadith = null }) {
    const { errors } = usePage().props;
    const isEdit = !!hadith;

    const [values, setValues] = useState({
        collection: hadith?.collection || '',
        hadith_number: hadith?.hadith_number || '',
        title: hadith?.title || '',
        text_ar: hadith?.text_ar || '',
        text_en: hadith?.text_en || '',
        text_fr: hadith?.text_fr || '',
        grade: hadith?.grade || '',
        graded_by: hadith?.graded_by || '',
        narrator: hadith?.narrator || '',
        url_source: hadith?.url_source || '',
        is_featured: hadith?.is_featured || false,
        book_number: hadith?.book_number || '',
        book_name_ar: hadith?.book_name_ar || '',
        book_name_en: hadith?.book_name_en || '',
        chapter_number: hadith?.chapter_number || '',
        chapter_name_ar: hadith?.chapter_name_ar || '',
        chapter_name_en: hadith?.chapter_name_en || '',
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (isEdit) {
            router.put(`/admin/hadiths/${hadith.id}`, values);
        } else {
            router.post('/admin/hadiths', values);
        }
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${isEdit ? 'Éditer' : 'Ajouter'} hadith`} />

            <PageHeader
                title={isEdit ? 'Éditer le hadith' : 'Ajouter un hadith'}
                subtitle={isEdit ? 'Modifier les informations du hadith' : 'Créer un nouveau hadith'}
            />

            <FormCard className="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Collection"
                            type="text"
                            name="collection"
                            value={values.collection}
                            onChange={handleChange}
                            placeholder="ex: an-nawawi"
                            error={errors.collection}
                        />
                        <Input
                            label="N° hadith"
                            type="number"
                            name="hadith_number"
                            value={values.hadith_number}
                            onChange={handleChange}
                            min="1"
                            error={errors.hadith_number}
                        />
                    </div>

                    <Input
                        label="Titre"
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        error={errors.title}
                    />

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
                        label="Texte FR"
                        name="text_fr"
                        value={values.text_fr}
                        onChange={handleChange}
                        rows="3"
                        error={errors.text_fr}
                    />

                    <Textarea
                        label="Texte EN"
                        name="text_en"
                        value={values.text_en}
                        onChange={handleChange}
                        rows="3"
                        error={errors.text_en}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Grade"
                            type="text"
                            name="grade"
                            value={values.grade}
                            onChange={handleChange}
                            error={errors.grade}
                        />
                        <Input
                            label="Graded by"
                            type="text"
                            name="graded_by"
                            value={values.graded_by}
                            onChange={handleChange}
                            error={errors.graded_by}
                        />
                        <Input
                            label="Narrateur"
                            type="text"
                            name="narrator"
                            value={values.narrator}
                            onChange={handleChange}
                            error={errors.narrator}
                        />
                    </div>

                    <Input
                        label="URL source"
                        type="url"
                        name="url_source"
                        value={values.url_source}
                        onChange={handleChange}
                        placeholder="https://…"
                        error={errors.url_source}
                    />

                    <div className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            name="is_featured"
                            checked={values.is_featured}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Mis en avant</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <SubmittingButton loading={false} loadingText={isEdit ? 'Mise à jour…' : 'Création…'}>
                            {isEdit ? 'Mettre à jour' : 'Créer'}
                        </SubmittingButton>
                        <CancelLink href="/admin/hadiths" />
                    </div>
                </form>
            </FormCard>
        </AdminLayout>
    );
}
