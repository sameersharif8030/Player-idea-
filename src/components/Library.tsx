import React, { useState, useRef } from 'react';
import { Track } from '../types';
import { 
  Folder, Music, Disc, User, Search, SortAsc, 
  Upload, Trash2, Heart, Plus, FileAudio, Play, Pause
} from 'lucide-react';

interface LibraryProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onUploadTracks: (files: FileList) => void;
  onDeleteTrack: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

type LibraryTab = 'SONGS' | 'ALBUMS' | 'ARTISTS' | 'FOLDERS';

export default function Library({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onUploadTracks,
  onDeleteTrack,
  onToggleFavorite
}: LibraryProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('SONGS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'TITLE' | 'ARTIST' | 'DURATION'>('TITLE');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter & Search Tracks
  const filteredTracks = tracks.filter(track => {
    const query = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query) ||
      (track.folder && track.folder.toLowerCase().includes(query))
    );
  });

  // Sort Tracks
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
    if (sortBy === 'ARTIST') return a.artist.localeCompare(b.artist);
    if (sortBy === 'DURATION') return a.duration - b.duration;
    return 0;
  });

  // Groupings for sub-tabs
  const albums = Array.from(new Set(tracks.map(t => t.album)));
  const artists = Array.from(new Set(tracks.map(t => t.artist)));
  const folders = Array.from(new Set(tracks.map(t => t.folder || 'Local Library')));

  // Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadTracks(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadTracks(e.target.files);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden p-5 backdrop-blur-md">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-zinc-800/60 gap-3">
        <div className="text-left">
          <h2 className="text-base font-extrabold font-mono text-zinc-100 uppercase tracking-widest flex items-center space-x-2">
            <Folder className="w-5 h-5 text-pink-500" />
            <span>Local Music Deck</span>
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {tracks.length} Files Scanned • {tracks.filter(t => t.isFavorite).length} Favorites
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={triggerUpload}
          className="flex items-center justify-center space-x-1.5 bg-zinc-950 hover:bg-pink-600/10 hover:border-pink-500/30 text-pink-400 hover:text-pink-300 text-xs py-1.5 px-3.5 rounded-xl border border-pink-500/10 transition-all cursor-pointer shadow-sm shadow-pink-500/2"
        >
          <Upload className="w-4 h-4" />
          <span className="font-semibold">Add Local Audio</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="audio/*" 
          className="hidden" 
        />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        
        {/* Search bar */}
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search titles, albums, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/20 transition-all"
          />
        </div>

        {/* Sort select */}
        <div className="md:col-span-4 relative">
          <SortAsc className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full appearance-none bg-zinc-950/80 border border-zinc-800/80 rounded-xl py-2 pl-10 pr-8 text-xs text-zinc-300 focus:outline-none focus:border-pink-500/40 transition-all cursor-pointer"
          >
            <option value="TITLE">Sort by Title</option>
            <option value="ARTIST">Sort by Artist</option>
            <option value="DURATION">Sort by Duration</option>
          </select>
        </div>

      </div>

      {/* MAIN LAYOUT: Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 mb-4 text-xs font-mono">
        {(['SONGS', 'ALBUMS', 'ARTISTS', 'FOLDERS'] as LibraryTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-center font-bold tracking-wider transition-all cursor-pointer ${activeTab === tab ? 'bg-pink-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TRACK LISTING CONTAINER */}
      <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin relative min-h-[220px]">
        
        {/* SONGS VIEW */}
        {activeTab === 'SONGS' && (
          <div className="space-y-1.5 text-left">
            {sortedTracks.length > 0 ? (
              sortedTracks.map(track => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'bg-pink-600/10 border-pink-500/30' 
                        : 'bg-zinc-950/40 border-zinc-950 hover:bg-zinc-900/40 hover:border-zinc-800'
                    }`}
                  >
                    {/* Cover Art and Info */}
                    <div 
                      onClick={() => onSelectTrack(track)}
                      className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${track.coverColor || 'from-pink-500 to-purple-600'} flex items-center justify-center shadow-inner`}>
                        <Music className="w-4 h-4 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-pink-400' : 'text-zinc-200'}`}>
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center space-x-3 ml-3 font-mono text-[10px] text-zinc-500">
                      <span>{formatDuration(track.duration)}</span>
                      
                      {/* Favorite Button */}
                      <button 
                        onClick={() => onToggleFavorite(track.id)}
                        className={`hover:scale-110 active:scale-95 transition-all cursor-pointer p-1 rounded-md ${track.isFavorite ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>

                      {/* Delete button for uploaded songs */}
                      {track.id.startsWith('upload-') && (
                        <button 
                          onClick={() => onDeleteTrack(track.id)}
                          className="hover:scale-110 active:scale-95 text-zinc-600 hover:text-red-400 transition-all cursor-pointer p-1 rounded-md"
                          title="Remove custom track"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Music className="w-10 h-10 text-zinc-600 animate-bounce mb-2" />
                <p className="text-xs text-zinc-500">No tracks match search query</p>
              </div>
            )}
          </div>
        )}

        {/* ALBUMS VIEW */}
        {activeTab === 'ALBUMS' && (
          <div className="grid grid-cols-2 gap-3 text-left">
            {albums.map(album => {
              const albumTracks = tracks.filter(t => t.album === album);
              const firstCover = albumTracks[0]?.coverColor || 'from-pink-500 to-purple-600';
              return (
                <div 
                  key={album} 
                  onClick={() => { setSearchQuery(album); setActiveTab('SONGS'); }}
                  className="bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-950 hover:border-zinc-800 p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-2"
                >
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${firstCover} flex items-center justify-center text-white font-bold shadow-lg shadow-black/40`}>
                    <Disc className="w-12 h-12 text-white/50 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 truncate">{album}</h4>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">{albumTracks.length} Songs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ARTISTS VIEW */}
        {activeTab === 'ARTISTS' && (
          <div className="space-y-1.5 text-left">
            {artists.map(artist => {
              const artistTracks = tracks.filter(t => t.artist === artist);
              return (
                <div 
                  key={artist}
                  onClick={() => { setSearchQuery(artist); setActiveTab('SONGS'); }}
                  className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-950 hover:border-zinc-800 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">{artist}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{artistTracks.length} Songs</span>
                </div>
              );
            })}
          </div>
        )}

        {/* FOLDERS VIEW */}
        {activeTab === 'FOLDERS' && (
          <div className="space-y-1.5 text-left">
            {folders.map(folder => {
              const folderTracks = tracks.filter(t => t.folder === folder || (!t.folder && folder === 'Local Library'));
              return (
                <div 
                  key={folder}
                  onClick={() => { setSearchQuery(folder); setActiveTab('SONGS'); }}
                  className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-950 hover:border-zinc-800 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">{folder}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{folderTracks.length} Files</span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* BOTTOM DRAG AND DROP ZONE */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerUpload}
        className={`mt-4 border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
          dragActive 
            ? 'border-pink-500 bg-pink-500/5 text-pink-400' 
            : 'border-zinc-800 hover:border-pink-500/20 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-500'
        }`}
      >
        <Upload className="w-4 h-4 text-zinc-400 animate-pulse" />
        <span className="text-[10px] font-mono tracking-wider font-semibold uppercase">Drag & Drop Music File Here</span>
        <span className="text-[9px] text-zinc-600">Supports .mp3, .wav, .m4a, .ogg formats</span>
      </div>

    </div>
  );
}
