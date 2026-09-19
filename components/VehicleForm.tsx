'use client';

import { useState, useRef } from 'react';
import { Camera, X, Save, Upload } from 'lucide-react';
import { Vehicle } from '@/lib/types';

interface Props {
  vehicle?: Vehicle;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSave, onCancel }: Props) {
  const isEdit = !!vehicle;
  const [name, setName] = useState(vehicle?.name ?? '');
  const [plate, setPlate] = useState(vehicle?.plate ?? '');
  const [brand, setBrand] = useState(vehicle?.brand ?? '');
  const [model, setModel] = useState(vehicle?.model ?? '');
  const [year, setYear] = useState(vehicle?.year?.toString() ?? new Date().getFullYear().toString());
  const [currentKm, setCurrentKm] = useState(vehicle?.currentKm?.toString() ?? '');
  const [image, setImage] = useState<string | undefined>(vehicle?.image);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nama kendaraan wajib diisi'); return; }
    if (!plate.trim()) { setError('Nomor polisi wajib diisi'); return; }
    if (!brand.trim()) { setError('Merek wajib diisi'); return; }
    if (!model.trim()) { setError('Model wajib diisi'); return; }
    if (!year || !Number(year)) { setError('Tahun tidak valid'); return; }
    if (!currentKm || !Number.isFinite(Number(currentKm))) { setError('Odometer tidak valid'); return; }

    onSave({
      id: vehicle?.id ?? crypto.randomUUID(),
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      currentKm: Number(currentKm),
      image,
    });
  }

  return (
    <div className="vehicleFormOverlay" onClick={onCancel}>
      <div className="vehicleFormModal" onClick={e => e.stopPropagation()}>
        <div className="vehicleFormHeader">
          <h2>{isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</h2>
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
              <label>Nama Kendaraan *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Toyota Hilux Airside" />
            </div>

            <div className="vehicleFormRow">
              <div className="vehicleFormField">
                <label>Nomor Polisi *</label>
                <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="Contoh: BB 8124 NB" />
              </div>
              <div className="vehicleFormField">
                <label>Tahun *</label>
                <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="2024" />
              </div>
            </div>

            <div className="vehicleFormRow">
              <div className="vehicleFormField">
                <label>Merek *</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Contoh: Toyota" />
              </div>
              <div className="vehicleFormField">
                <label>Model *</label>
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="Contoh: Hilux 2.4" />
              </div>
            </div>

            <div className="vehicleFormField">
              <label>Odometer Saat Ini (KM) *</label>
              <input type="number" value={currentKm} onChange={e => setCurrentKm(e.target.value)} placeholder="Contoh: 50000" />
            </div>
          </div>

          {error && <p className="vehicleFormError"><X size={13} /> {error}</p>}

          <div className="vehicleFormActions">
            <button type="button" className="secondaryButton" onClick={onCancel}>Batal</button>
            <button type="submit" className="primaryButton vehicleFormSaveBtn">
              <Save size={15} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
