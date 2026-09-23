'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Save, Upload, Plus, Trash2, Tag, Settings2, Check } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { getStoredCategories, addCategory, deleteCategory } from '@/lib/storage';

interface Props {
  vehicle?: Vehicle;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSave, onCancel }: Props) {
  const isEdit = !!vehicle;
  const [name, setName] = useState(vehicle?.name ?? '');
  const [hullNumber, setHullNumber] = useState(vehicle?.hullNumber ?? '');
  const [plate, setPlate] = useState(vehicle?.plate ?? '');
  const [category, setCategory] = useState(vehicle?.category ?? '');
  const [brand, setBrand] = useState(vehicle?.brand ?? '');
  const [model, setModel] = useState(vehicle?.model ?? '');
  const [year, setYear] = useState(vehicle?.year?.toString() ?? new Date().getFullYear().toString());
  const [currentKm, setCurrentKm] = useState(vehicle?.currentKm?.toString() ?? '');
  const [image, setImage] = useState<string | undefined>(vehicle?.image);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Category management state
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  useEffect(() => {
    const cats = getStoredCategories();
    setCategoryList(cats);
    if (!category && cats.length > 0) {
      setCategory(cats[0]);
    }
  }, [category]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleAddNewCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    const updated = addCategory(trimmed);
    setCategoryList(updated);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  }

  function handleDeleteCategory(catName: string) {
    if (categoryList.length <= 1) {
      setError('Minimal harus ada 1 kategori');
      return;
    }
    const updated = deleteCategory(catName);
    setCategoryList(updated);
    if (category === catName) {
      setCategory(updated[0] || '');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nama kendaraan wajib diisi'); return; }
    if (!plate.trim()) { setError('Nomor polisi wajib diisi'); return; }
    if (!category.trim()) { setError('Pilih kategori kendaraan'); return; }
    if (!brand.trim()) { setError('Merek wajib diisi'); return; }
    if (!model.trim()) { setError('Model wajib diisi'); return; }
    if (!year || !Number(year)) { setError('Tahun tidak valid'); return; }
    if (!currentKm || !Number.isFinite(Number(currentKm))) { setError('Odometer tidak valid'); return; }

    onSave({
      id: vehicle?.id ?? `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      hullNumber: hullNumber.trim().toUpperCase() || undefined,
      plate: plate.trim().toUpperCase(),
      category: category.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      currentKm: Number(currentKm),
      image,
      a2bStatus: vehicle?.a2bStatus ?? 'READY',
    });
  }

  return (
    <div className="vehicleFormOverlay" onClick={onCancel}>
      <div className="vehicleFormModal" onClick={e => e.stopPropagation()}>
        <div className="vehicleFormHeader">
          <div>
            <h2>{isEdit ? 'Edit Unit Kendaraan / A2B' : 'Tambah Unit Kendaraan / A2B Baru'}</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Data unit akan tersimpan otomatis dan terhubung ke seluruh sistem.
            </p>
          </div>
          <button className="iconButton" onClick={onCancel}><X size={18} /></button>
        </div>

        <form className="vehicleFormBody" onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="vehicleFormPhotoSection">
            <div
              className={`vehicleFormPhoto ${image ? 'hasImage' : ''}`}
              onClick={() => fileRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Foto kendaraan" />
              ) : (
                <div className="vehicleFormPhotoPlaceholder">
                  <Camera size={28} />
                  <span>Upload Foto</span>
                </div>
              )}
              <div className="vehicleFormPhotoOverlay">
                <Upload size={16} />
                <span>{image ? 'Ganti Foto' : 'Pilih Foto'}</span>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              hidden
            />
            {image && (
              <button type="button" className="vehicleFormRemovePhoto" onClick={() => setImage(undefined)}>
                <X size={12} /> Hapus Foto
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="vehicleFormFields">
            <div className="vehicleFormField">
              <label>Nama Unit Kendaraan / A2B *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Pushback Tug TBL-180 atau Hilux Airside"
                required
              />
            </div>

            <div className="vehicleFormRow">
              <div className="vehicleFormField">
                <label>Nomor Lambung (Kode A2B)</label>
                <input
                  value={hullNumber}
                  onChange={e => setHullNumber(e.target.value)}
                  placeholder="Contoh: PBT-03, FT-03, AP-02"
                />
              </div>
              <div className="vehicleFormField">
                <label>Nomor Polisi / Plat *</label>
                <input
                  value={plate}
                  onChange={e => setPlate(e.target.value)}
                  placeholder="Contoh: BB 8124 NB"
                  required
                />
              </div>
            </div>

            {/* Category Field with Flexible Add & Delete */}
            <div className="vehicleFormField">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={12} /> Kategori Kendaraan (A2B) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(!isAddingCategory);
                      setIsManagingCategories(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: 'var(--teal)',
                      fontSize: '11px',
                      fontWeight: 750,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Plus size={12} /> {isAddingCategory ? 'Tutup' : 'Tambah Kategori'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManagingCategories(!isManagingCategories);
                      setIsAddingCategory(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: 'var(--muted)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    title="Kelola & hapus kategori yang tidak terpakai"
                  >
                    <Settings2 size={12} /> Kelola
                  </button>
                </div>
              </div>

              {/* Inline Add Category Form */}
              {isAddingCategory && (
                <div
                  style={{
                    background: 'var(--card-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px',
                    marginBottom: '8px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Ketik kategori baru (contoh: Sweeper Runway)"
                    style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="primaryButton"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <Check size={13} /> Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="secondaryButton"
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                  >
                    Batal
                  </button>
                </div>
              )}

              {/* Inline Manage/Delete Categories List */}
              {isManagingCategories && (
                <div
                  style={{
                    background: 'var(--card-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: '11.5px', color: 'var(--muted)' }}>
                    Klik ikon tempat sampah pada kategori yang ingin dihapus agar daftar tetap ringkas:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {categoryList.map(cat => (
                      <div
                        key={cat}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '11.5px',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          title={`Hapus kategori "${cat}"`}
                          style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--red)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  background: 'var(--card-2)',
                  color: 'var(--text)',
                  borderRadius: '10px',
                  padding: '11px 13px',
                  outline: 0,
                  fontSize: '13px',
                }}
                required
              >
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicleFormRow">
              <div className="vehicleFormField">
                <label>Merek Kendaraan / Pabrikan *</label>
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="Contoh: Goldhofer, Toyota, Oshkosh"
                  required
                />
              </div>
              <div className="vehicleFormField">
                <label>Model / Tipe *</label>
                <input
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="Contoh: TBL-180 Towbarless"
                  required
                />
              </div>
            </div>

            <div className="vehicleFormRow">
              <div className="vehicleFormField">
                <label>Tahun Pembuatan *</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="2024"
                  required
                />
              </div>
              <div className="vehicleFormField">
                <label>Odometer Saat Ini (KM) *</label>
                <input
                  type="number"
                  value={currentKm}
                  onChange={e => setCurrentKm(e.target.value)}
                  placeholder="Contoh: 50000"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="vehicleFormError"><X size={13} /> {error}</p>}

          <div className="vehicleFormActions">
            <button type="button" className="secondaryButton" onClick={onCancel}>Batal</button>
            <button type="submit" className="primaryButton vehicleFormSaveBtn">
              <Save size={15} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Unit A2B'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
