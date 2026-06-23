import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, RefreshCw, CheckCircle, Smartphone, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

type QRStatus = 'loading' | 'waiting' | 'scanned' | 'success' | 'expired';

export default function LoginPage() {
  const { setLoggedIn, fetchAccount, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [qrImage, setQrImage] = useState<string>('');
  const [qrKey, setQrKey] = useState<string>('');
  const [status, setStatus] = useState<QRStatus>('loading');
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const mountedRef = useRef(true);

  // 已登录则跳转首页
  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  // 初始化：获取二维码 key + 图片
  const initQR = async () => {
    setStatus('loading');
    try {
      // 1. 获取 key
      const keyRes = await fetch('/api/auth/qr/key');
      const keyData = await keyRes.json();
      if (!keyData.success || !keyData.unikey) {
        setStatus('expired');
        return;
      }
      setQrKey(keyData.unikey);

      // 2. 获取二维码图片（NCM 自带生成）
      const createRes = await fetch(`/api/auth/qr/create?key=${keyData.unikey}&qrimg=true`);
      const createData = await createRes.json();
      if (createData.success && createData.qrimg) {
        setQrImage(createData.qrimg);
        setStatus('waiting');
      } else {
        setStatus('expired');
      }
    } catch {
      setStatus('expired');
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    initQR();
    return () => { mountedRef.current = false; };
  }, []);

  // 轮询检测扫码状态
  useEffect(() => {
    if (status !== 'waiting' && status !== 'scanned') return;

    pollingRef.current = setInterval(async () => {
      if (!mountedRef.current || !qrKey) return;
      try {
        const res = await fetch(`/api/auth/qr/check?key=${qrKey}`);
        const data = await res.json();
        if (!mountedRef.current) return;

        if (data.code === 802) {
          setStatus('scanned');
        } else if (data.code === 803) {
          setStatus('success');
          if (data.cookie) {
            setLoggedIn(data.cookie);
            fetchAccount();
            setTimeout(() => navigate('/', { replace: true }), 1200);
          }
        } else if (data.code === 800) {
          setStatus('expired');
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => { clearInterval(pollingRef.current); };
  }, [status, qrKey, setLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        title="返回首页"
      >
        <ChevronLeft size={22} />
      </button>

      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-purple rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] bg-[#1c1c1e] rounded-2xl p-8 shadow-2xl border border-white/10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-red via-brand-purple to-brand-indigo flex items-center justify-center shadow-lg shadow-brand-red/20 mb-4">
            <Music2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">登录 MYMUSIC</h1>
          <p className="text-text-secondary text-sm mt-1">使用网易云音乐 App 扫码登录</p>
        </div>

        {/* 二维码区域 */}
        <div className="relative bg-white rounded-xl p-4 mx-auto w-[260px] h-[260px] flex items-center justify-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-brand-red rounded-full animate-spin" />
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <RefreshCw size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">二维码已过期</p>
              <button
                onClick={initQR}
                className="px-5 py-2 bg-brand-red text-white text-sm font-medium rounded-pill hover:bg-brand-red/90 transition-colors"
              >
                刷新二维码
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
              <p className="text-sm font-medium text-green-600">登录成功，正在跳转...</p>
            </div>
          )}

          {(status === 'waiting' || status === 'scanned') && qrImage && (
            <img src={qrImage} alt="登录二维码" className="w-[228px] h-[228px] object-contain" />
          )}

          {/* 过期蒙层 */}
          {status === 'expired' && (
            <div className="absolute inset-0 bg-white/60 rounded-xl backdrop-blur-sm" />
          )}
        </div>

        {/* 状态提示 */}
        <div className="mt-6 text-center">
          {status === 'waiting' && (
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <Smartphone size={18} />
              <span className="text-sm">请使用网易云音乐 App 扫描二维码</span>
            </div>
          )}
          {status === 'scanned' && (
            <div className="flex items-center justify-center gap-2 text-white">
              <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="text-sm font-medium">已扫码，请在手机上确认登录</span>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-text-muted mt-6">
          登录后可使用个性化推荐、收藏歌单等完整功能
        </p>
      </div>
    </div>
  );
}