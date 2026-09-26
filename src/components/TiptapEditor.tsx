'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { uploadImage } from '@/app/actions/upload';
import { useRef, useState } from 'react';

// Özel Font Size Eklentisi
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-copper underline cursor-pointer' } }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      FontSize,
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap max-w-none focus:outline-none min-h-[400px] p-6 text-dark',
      },
    },
  });

  if (!editor) {
    return null;
  }

  // Butonlara tıklandığında editörün odak kaybetmemesi (bold vb. yazmadan önce tıklanabilmesi) için preventDefault kullanıyoruz.
  const preventDefault = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="border border-line-dark rounded bg-white overflow-hidden flex flex-col">
      {/* Editör Araç Çubuğu (Toolbar) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-parchment-2 border-b border-line-light shadow-sm">
        
        {/* Metin Stilleri */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-line-light">
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${
              editor.isActive('bold') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 text-sm italic font-serif rounded transition-colors ${
              editor.isActive('italic') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1.5 text-sm underline rounded transition-colors ${
              editor.isActive('underline') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            U
          </button>
        </div>

        {/* Renk ve Boyut */}
        <div className="flex items-center gap-2 bg-white p-1 rounded border border-line-light px-3">
          <input
            type="color"
            onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#241A12'}
            data-testid="setColor"
            className="w-6 h-6 p-0 border-0 cursor-pointer"
            title="Yazı Rengi"
          />
          <div className="w-px h-5 bg-line-dark mx-1"></div>
          <select 
            className="text-sm bg-transparent border-0 focus:outline-none cursor-pointer"
            onChange={(e) => {
              if (e.target.value === 'default') {
                // @ts-ignore
                editor.chain().focus().unsetFontSize().run();
              } else {
                // @ts-ignore
                editor.chain().focus().setFontSize(e.target.value).run();
              }
            }}
          >
            <option value="default">Boyut (Normal)</option>
            <option value="12px">Çok Küçük (12px)</option>
            <option value="14px">Küçük (14px)</option>
            <option value="16px">Normal (16px)</option>
            <option value="20px">Büyük (20px)</option>
            <option value="24px">Çok Büyük (24px)</option>
            <option value="32px">Devasa (32px)</option>
          </select>
        </div>

        {/* Başlıklar */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-line-light">
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors font-serif ${
              editor.isActive('heading', { level: 2 }) ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors font-serif ${
              editor.isActive('heading', { level: 3 }) ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            H3
          </button>
        </div>

        {/* Hizalama */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-line-light">
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            Sol
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            Orta
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            Sağ
          </button>
        </div>

        {/* Listeler ve Diğerleri */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-line-light">
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive('bulletList') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            • Liste
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive('orderedList') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            1. Liste
          </button>
          <button
            type="button"
            onMouseDown={preventDefault}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              editor.isActive('blockquote') ? 'bg-copper text-light' : 'hover:bg-line-light text-dark'
            }`}
          >
            "
          </button>
        <button
          type="button"
          onMouseDown={preventDefault}
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            const url = window.prompt('URL Ekle (Örn: https://google.com):', previousUrl)
            
            // iptal edildiyse çık
            if (url === null) {
              return
            }

            // url boşsa linki kaldır
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
              return
            }

            // Metin seçili mi kontrol et
            const { empty } = editor.state.selection;
            
            if (empty) {
              // Metin seçili değilse, link metnini sor ve HTML olarak ekle
              const text = window.prompt('Link için görünecek metni girin:');
              if (text) {
                editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
              }
            } else {
              // Metin seçiliyse normal setLink kullan
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            editor.isActive('link') ? 'bg-copper text-light shadow-inner' : 'hover:bg-line-light text-dark'
          }`}
        >
          🔗 Link
        </button>

        <div className="w-px h-6 bg-line-dark/20 mx-1"></div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-line-light text-dark flex items-center gap-1"
          disabled={isUploading}
        >
          {isUploading ? '⏳' : '🖼️'} Görsel
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await uploadImage(formData);
            if (res.url) {
              editor.chain().focus().setImage({ src: res.url }).run();
            } else {
              alert(res.error || 'Resim yüklenemedi.');
            }
            
            setIsUploading(false);
            e.target.value = ''; // reset input
          }}
        />
        </div>

      </div>
      
      {/* Yazı Alanı */}
      <div className="flex-grow cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
