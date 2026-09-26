'use client';

import { useState } from 'react';
import DeleteButton from './DeleteButton';
import { editAudioTrack } from '@/app/actions/audio';

export default function TrackRow({ track, index }: { track: any, index: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return alert("Başlık boş olamaz.");
    
    setLoading(true);
    const res = await editAudioTrack(track.id, title, artist);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <tr className="border-b border-line-light last:border-0 hover:bg-parchment/50 transition-colors">
      <td className="p-4 text-dark-dim font-mono text-sm">{index + 1}</td>
      
      <td className="p-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full text-sm border border-line-light rounded p-1.5 focus:outline-none focus:border-copper bg-white"
              placeholder="Şarkı adı"
            />
            <input 
              type="text" 
              value={artist} 
              onChange={e => setArtist(e.target.value)} 
              className="w-full text-xs border border-line-light rounded p-1.5 focus:outline-none focus:border-copper bg-white"
              placeholder="Sanatçı adı (opsiyonel)"
            />
          </div>
        ) : (
          <>
            <div className="font-semibold text-dark text-sm">{track.title}</div>
            <div className="text-xs text-dark-dim">{track.artist}</div>
          </>
        )}
      </td>
      
      <td className="p-4 text-dark-dim text-xs font-mono">
        {new Date(track.created_at).toLocaleDateString('tr-TR')}
      </td>
      
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                {loading ? '...' : 'Kaydet'}
              </button>
              <button 
                onClick={() => {
                  setTitle(track.title);
                  setArtist(track.artist || '');
                  setIsEditing(false);
                }} 
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs font-semibold px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                Düzenle
              </button>
              <DeleteButton id={track.id} url={track.audio_url} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
