'use client';

import { useState } from 'react';
import { Plus, X, CalendarDays, CalendarClock, Wrench, Settings2 } from 'lucide-react';
import { CustomRule, DayOfWeek, RuleMode } from '@/lib/types';

const ALL_DAYS: DayOfWeek[] = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface Props {
  vehicleId: string;
  rules: CustomRule[];
  onAddRule: (rule: CustomRule) => void;
}

export default function RulesManager({ vehicleId, rules, onAddRule }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<RuleMode>('BERKALA');
  const [name, setName] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalDays, setIntervalDays] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  function toggleDay(d: DayOfWeek) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const newRule: CustomRule = {
      id: crypto.randomUUID(),
      vehicleId,
      mode,
      name: name.trim(),
      active: true,
    };
    if (mode === 'BERKALA') {
      newRule.intervalKm = Number(intervalKm) || undefined;
      newRule.intervalDays = Number(intervalDays) || undefined;
    } else {
      newRule.days = selectedDays.length ? selectedDays : undefined;
    }
    onAddRule(newRule);
    resetForm();
  }

  function resetForm() {
    setShowForm(false);
    setMode('BERKALA');
    setName('');
    setIntervalKm('');
    setIntervalDays('');
    setSelectedDays([]);
  }

  if (showForm) {
    return (
      <div className="panel spanFull rulesPanel">
        <div className="panelHead">
          <div className="rulesPanelTitle">
            <Settings2 size={20} />
            <h2>Aturan Perawatan</h2>
          </div>
          <button className="secondaryButton rulesCancelBtn" onClick={resetForm}>Batal</button>
        </div>

        <div className="ruleFormBody">
          <div className="ruleFormSection">
            <label className="ruleFormLabel">Mode Perawatan</label>
            <div className="modeToggle">
              <button
                className={`modeOption ${mode === 'BERKALA' ? 'active' : ''}`}
                onClick={() => setMode('BERKALA')}
              >
                <CalendarClock size={20} />
                <span>BERKALA</span>
              </button>
              <button
                className={`modeOption ${mode === 'MINGGUAN' ? 'active' : ''}`}
                onClick={() => setMode('MINGGUAN')}
              >
                <CalendarDays size={20} />
                <span>MINGGUAN</span>
              </button>
            </div>
          </div>

          <div className="ruleFormSection">
            <label className="ruleFormLabel">Nama Perawatan</label>
            <input
              className="ruleFormInput"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Ganti Oli, Cek AC, dll"
            />
          </div>

          {mode === 'BERKALA' ? (
            <div className="ruleFormRow">
              <div className="ruleFormSection">
                <label className="ruleFormLabel">Interval (KM)</label>
                <input
                  className="ruleFormInput"
                  type="number"
                  value={intervalKm}
                  onChange={e => setIntervalKm(e.target.value)}
                  placeholder="Contoh: 5000"
                />
              </div>
              <div className="ruleFormSection">
                <label className="ruleFormLabel">Interval (Hari)</label>
                <input
                  className="ruleFormInput"
                  type="number"
                  value={intervalDays}
                  onChange={e => setIntervalDays(e.target.value)}
                  placeholder="Contoh: 90"
                />
              </div>
            </div>
          ) : (
            <div className="ruleFormSection">
              <label className="ruleFormLabel">Pilih Hari</label>
              <div className="ruleFormDayPills">
                {ALL_DAYS.map(d => (
                  <button
                    key={d}
                    className={`ruleFormDayPill ${selectedDays.includes(d) ? 'active' : ''}`}
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="ruleFormHint">Pilih hari-hari dimana perawatan ini dijadwalkan</span>
            </div>
          )}

          <button className="ruleFormSubmitBtn" onClick={handleSubmit}>
            Simpan Aturan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel spanFull rulesPanel">
      <div className="panelHead">
        <div className="rulesPanelTitle">
          <Settings2 size={20} />
          <h2>Aturan Perawatan</h2>
        </div>
        <button className="secondaryButton" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Tambah
        </button>
      </div>

      <div className="rulesCardsGrid">
        {rules.map(r => (
          <div key={r.id} className="ruleCardItem">
            <div className="ruleCardTop">
              <strong>{r.name}</strong>
              <span className={`ruleStatusBadge ${r.active ? 'active' : ''}`}>
                {r.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="ruleCardInfo">
              {r.mode === 'BERKALA' ? (
                <span>{r.intervalKm?.toLocaleString('id-ID')} KM / {r.intervalDays} Hari</span>
              ) : (
                <span className="ruleCardDays">
                  <CalendarDays size={12} />
                  {r.days?.join(', ')}
                </span>
              )}
            </div>
          </div>
        ))}

        <button className="addRuleCard" onClick={() => setShowForm(true)}>
          <Plus size={22} />
          <span>Tambah Aturan</span>
        </button>
      </div>
    </div>
  );
}
