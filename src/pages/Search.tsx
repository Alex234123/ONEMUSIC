import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, User, ListMusic } from 'lucide-react';
import { searchAll, searchByType, searchHot } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { formatTime } from '../utils/format';
import type { Song, Artist, Playlist } from '../types';

type SearchTab = 'songs' | 'artists' | 'playlists';

const tabs: { key: SearchTab; label: string; icon: typeof Music }[] = [
  { key: 'songs', label: '歌曲', icon: Music },
  { key: 'artists', label: '歌手', icon: User },
  { key: 'playlists', label: '歌单', icon: ListMusic },
];

export default function SearchPage() {
  const { playSong } = usePlayerStore();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [hots, setHots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<SearchTab>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    searchHot()
      .then((data) => {
        if (data?.hots) setHots(data.hots.map((h: any) => h.searchWord || h.first || ''));
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (kw?: string) => {
    const q = kw || keyword.trim();
    if (!q) return;
    setSearching(true);
    setSearched(true);
    try {
      const data = await searchAll(q, 6);
      setSongs(data.songs || []);
      setArtists(data.artists || []);
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSongs([]);
      setArtists([]);
      setPlaylists([]);
    }
    setSearching(false);
  };

  const loadMore = async (type: SearchTab) => {
    const q = keyword.trim();
    if (!q) return;
    try {
      const typeMap = { songs: 1, artists: 100, playlists: 1000 };
      const data = await searchByType(q, typeMap[type], 30);
      if (type === 'songs') setSongs(data.songs || []);
      else if (type === 'artists') setArtists(data.artists || []);
      else setPlaylists(data.playlists || []);
    } catch {}
  };

  const handlePlay = (song: Song) => {
    playSong(song, songs);
  };

  const hasResults = songs.length > 0 || artists.length > 0 || playlists.length > 0;

  return (
    <div className="px-8 pt-12 pb-8">
      {/* 搜索框 */}
      <div className="max-w-[600px] mb-10">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
              autoComplete="off"
              placeholder="搜索歌曲、歌手、歌单..."
              className="w-full h-14 pl-12 pr-4 bg-surface-card border border-white/10 rounded-pill text-white text-lg
                placeholder:text-text-muted outline-none focus:border-brand-red/50 focus:ring-4 focus:ring-brand-red/10
                transition-all"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="h-14 px-6 rounded-pill bg-brand-red text-white font-medium text-sm
              hover:bg-brand-red/80 active:scale-95 transition-all shrink-0"
          >
            搜索
          </button>
        </div>
      </div>

      {/* 热门搜索 */}
      {!searched && hots.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">热门搜索</h2>
          <div className="flex flex-wrap gap-2">
            {hots.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setKeyword(h);
                  handleSearch(h);
                }}
                className="px-4 py-1.5 rounded-pill bg-surface-card text-sm text-text-secondary
                  hover:text-white hover:bg-surface-hover transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {searched && (
        <div>
          {searching ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-card rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-surface-card rounded mb-1" />
                    <div className="h-3 w-32 bg-surface-card rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasResults ? (
            <>
              {/* 分类概览 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* 歌曲 */}
                {songs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Music size={16} className="text-brand-red" /> 歌曲
                      </h3>
                      <button
                        onClick={() => { setActiveTab('songs'); loadMore('songs'); }}
                        className="text-xs text-text-muted hover:text-brand-red transition-colors"
                      >
                        查看更多
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {songs.slice(0, 6).map((song, i) => (
                        <button
                          key={song.id}
                          onClick={() => handlePlay(song)}
                          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                        >
                          <span className="w-6 text-center text-xs text-text-muted tabular-nums shrink-0">{i + 1}</span>
                          <img src={song.album.picUrl} alt="" className="w-9 h-9 rounded object-cover shrink-0" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{song.name}</p>
                            <p className="text-xs text-text-secondary truncate">
                              {song.artists.map((a) => a.name).join(', ')}
                            </p>
                          </div>
                          <span className="text-xs text-text-muted tabular-nums shrink-0">
                            {formatTime(song.duration / 1000)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 歌手 */}
                {artists.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <User size={16} className="text-brand-purple" /> 歌手
                      </h3>
                      <button
                        onClick={() => { setActiveTab('artists'); loadMore('artists'); }}
                        className="text-xs text-text-muted hover:text-brand-red transition-colors"
                      >
                        查看更多
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {artists.slice(0, 6).map((artist) => (
                        <div key={artist.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">
                          {artist.picUrl ? (
                            <img src={artist.picUrl} alt="" className="w-16 h-16 rounded-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center">
                              <User size={24} className="text-text-muted" />
                            </div>
                          )}
                          <p className="text-xs text-white text-center truncate w-full">{artist.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 歌单 */}
                {playlists.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <ListMusic size={16} className="text-brand-indigo" /> 歌单
                      </h3>
                      <button
                        onClick={() => { setActiveTab('playlists'); loadMore('playlists'); }}
                        className="text-xs text-text-muted hover:text-brand-red transition-colors"
                      >
                        查看更多
                      </button>
                    </div>
                    <div className="space-y-2">
                      {playlists.slice(0, 6).map((pl) => (
                        <button
                          key={pl.id}
                          onClick={() => navigate(`/playlist/${pl.id}`)}
                          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                        >
                          <img
                            src={pl.coverImgUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{pl.name}</p>
                            <p className="text-xs text-text-secondary truncate">{pl.trackCount} 首</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 分类详情标签页 */}
              <div>
                <div className="flex gap-1 mb-4 border-b border-white/5">
                  {tabs.map(({ key, label, icon: Icon }) => {
                    const count = key === 'songs' ? songs.length : key === 'artists' ? artists.length : playlists.length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2
                          ${activeTab === key
                            ? 'text-brand-red border-brand-red'
                            : 'text-text-secondary border-transparent hover:text-white'}`}
                      >
                        <Icon size={14} />
                        {label}
                        <span className="text-xs text-text-muted">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 歌曲列表 */}
                {activeTab === 'songs' && songs.length > 0 && (
                  <div className="space-y-0.5">
                    {songs.map((song, i) => (
                      <button
                        key={song.id}
                        onClick={() => handlePlay(song)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                      >
                        <span className="w-8 text-center text-sm text-text-muted tabular-nums shrink-0">{i + 1}</span>
                        <img src={song.album.picUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{song.name}</p>
                          <p className="text-xs text-text-secondary truncate">
                            {song.artists.map((a) => a.name).join(', ')} &middot; {song.album.name}
                          </p>
                        </div>
                        <span className="text-xs text-text-muted tabular-nums shrink-0">
                          {formatTime(song.duration / 1000)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 歌手列表 */}
                {activeTab === 'artists' && artists.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {artists.map((artist) => (
                      <div key={artist.id} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer">
                        {artist.picUrl ? (
                          <img src={artist.picUrl} alt="" className="w-20 h-20 rounded-full object-cover shadow-lg" loading="lazy" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center">
                            <User size={32} className="text-text-muted" />
                          </div>
                        )}
                        <p className="text-sm text-white text-center truncate w-full">{artist.name}</p>
                        {artist.alias && artist.alias.length > 0 && (
                          <p className="text-xs text-text-muted text-center truncate w-full">{artist.alias[0]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 歌单列表 */}
                {activeTab === 'playlists' && playlists.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => navigate(`/playlist/${pl.id}`)}
                        className="flex flex-col gap-2 p-2 rounded-xl hover:bg-surface-hover transition-colors text-left"
                      >
                        <img
                          src={pl.coverImgUrl}
                          alt=""
                          className="w-full aspect-square rounded-lg object-cover shadow-lg"
                          loading="lazy"
                        />
                        <p className="text-sm text-white truncate">{pl.name}</p>
                        <p className="text-xs text-text-secondary truncate">{pl.trackCount} 首</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">未找到相关结果</p>
              <p className="text-text-muted text-sm mt-1">尝试其他关键词搜索</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
