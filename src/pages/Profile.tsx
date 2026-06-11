import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ListMusic, Clock, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getUserPlaylists } from '../services/api';
import type { Playlist } from '../types';

export default function Profile() {
  const { isLoggedIn, nickname, avatarUrl, uid, fetchAccount } = useAuthStore();
  const navigate = useNavigate();
  const [likedPlaylist, setLikedPlaylist] = useState<Playlist | null>(null);
  const [collectedPlaylists, setCollectedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedUid, setResolvedUid] = useState<number | null>(uid);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { replace: true }); return; }

    // 如果已有 uid 直接用
    if (uid) { setResolvedUid(uid); return; }

    // 否则通过 API 获取
    const cookie = localStorage.getItem('netease_cookie');
    if (!cookie) { setLoading(false); return; }

    fetch('/api/auth/account', { headers: { 'x-netease-cookie': cookie } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          const newUid = data.profile.userId || data.account?.id;
          if (newUid) {
            setResolvedUid(newUid);
            // 同步到 store
            fetchAccount();
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn, navigate, uid, fetchAccount]);

  useEffect(() => {
    if (!resolvedUid) return;
    setLoading(true);
    getUserPlaylists(resolvedUid)
      .then((data) => {
        const list = data.playlist || [];
        if (list.length > 0) setLikedPlaylist(list[0]);
        if (list.length > 1) setCollectedPlaylists(list.slice(1));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resolvedUid]);

  if (!isLoggedIn) return null;

  return (
    <div className="px-8 pt-8 pb-8">
      {/* 用户信息头部 */}
      <div className="flex items-center gap-5 mb-10">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-red/20 flex items-center justify-center">
            <User size={32} className="text-brand-red" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{nickname || '用户'}</h1>
          <p className="text-sm text-text-secondary mt-1">个人中心</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-card rounded-lg" />
          ))}
        </div>
      ) : !resolvedUid ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">无法获取用户信息，请重新登录</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-5 py-2 bg-brand-red text-white text-sm font-medium rounded-pill hover:bg-brand-red/90 transition-colors"
          >
            重新登录
          </button>
        </div>
      ) : (
        <>
          {/* 我喜欢的音乐 */}
          {likedPlaylist && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={20} className="text-brand-red" />
                <h2 className="text-lg font-semibold text-white">我喜欢的音乐</h2>
              </div>
              <button
                onClick={() => navigate(`/playlist/${likedPlaylist.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-brand-red/20 to-brand-purple/10
                  hover:from-brand-red/30 hover:to-brand-purple/20 transition-all group w-full text-left"
              >
                <div className="w-14 h-14 rounded-lg bg-brand-red/30 flex items-center justify-center shrink-0">
                  <Heart size={24} className="text-brand-red" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-white group-hover:text-brand-red transition-colors">
                    {likedPlaylist.name}
                  </p>
                  <p className="text-sm text-text-secondary">{likedPlaylist.trackCount} 首歌曲</p>
                </div>
              </button>
            </section>
          )}

          {/* 收藏的歌单 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ListMusic size={20} className="text-brand-purple" />
              <h2 className="text-lg font-semibold text-white">收藏的歌单</h2>
              <span className="text-sm text-text-muted ml-1">{collectedPlaylists.length}</span>
            </div>
            {collectedPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {collectedPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                    className="group text-left"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <img
                        src={pl.coverImgUrl}
                        alt={pl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <p className="text-sm text-white truncate group-hover:text-brand-red transition-colors">{pl.name}</p>
                    <p className="text-xs text-text-muted truncate">{pl.trackCount} 首</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-secondary">暂无收藏的歌单</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}