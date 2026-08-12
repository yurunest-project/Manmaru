import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSameDay, startOfDay } from "../lib/dates";
import { authErrorMessage, returningFromAuthRedirect } from "../lib/authFlow";
import { auth, db, firebaseReady } from "../lib/firebase";
import { samplePlans } from "../lib/samples";
import type {
  CoupleProfile,
  DatePlan,
  Destination,
  Route,
  Tab,
  ThemeId,
  UserProfile,
} from "../types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function inviteCode(length = 6) {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
}

function toDate(value: unknown, fallback = new Date()) {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return fallback;
}

function planFromDoc(id: string, data: Record<string, unknown>): DatePlan {
  return {
    id,
    date: toDate(data.date),
    title: String(data.title ?? ""),
    memo: String(data.memo ?? ""),
    destinations: Array.isArray(data.destinations)
      ? (data.destinations as Destination[])
      : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function profileFromData(data: Record<string, unknown>, user?: User | null): UserProfile {
  const displayName = String(data.displayName || user?.displayName || "パートナー");
  const email = String(data.email || user?.email || "");
  const nickname = String(data.nickname || displayName);
  return {
    displayName,
    email,
    nickname,
    coupleId: (data.coupleId as string | null | undefined) ?? null,
    themeId: (data.themeId as ThemeId) || "sakura",
    createdAt: toDate(data.createdAt),
  };
}

type AppState = {
  route: Route;
  tab: Tab;
  themeId: ThemeId;
  profile: UserProfile | null;
  couple: CoupleProfile | null;
  dates: DatePlan[];
  error: string | null;
  busy: boolean;
  preview: boolean;
  firebaseReady: boolean;
  nextDate: DatePlan | null;
  sortedDates: DatePlan[];
  setTab: (tab: Tab) => void;
  setError: (message: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  switchAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  createCouple: () => Promise<void>;
  joinCouple: (code: string) => Promise<void>;
  leaveCouple: () => Promise<void>;
  setTheme: (id: ThemeId) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  saveDate: (plan: DatePlan) => Promise<void>;
  deleteDate: (plan: DatePlan) => Promise<void>;
  datesOn: (day: Date) => DatePlan[];
  enterPreview: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>("loading");
  const [tab, setTab] = useState<Tab>("calendar");
  const [themeId, setThemeId] = useState<ThemeId>("sakura");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [couple, setCouple] = useState<CoupleProfile | null>(null);
  const [dates, setDates] = useState<DatePlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const nextDate = useMemo(() => {
    const start = startOfDay(new Date()).getTime();
    return [...dates]
      .filter((plan) => startOfDay(plan.date).getTime() >= start)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;
  }, [dates]);

  const sortedDates = useMemo(
    () => [...dates].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [dates],
  );

  const datesOn = useCallback(
    (day: Date) => dates.filter((plan) => isSameDay(plan.date, day)),
    [dates],
  );

  const ensureUser = useCallback(async (user: User) => {
    if (!db) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const profile = profileFromData(data, user);
      const needsBackfill = !data.email || !data.nickname;
      if (needsBackfill) {
        await updateDoc(ref, {
          email: profile.email,
          nickname: profile.nickname,
          displayName: profile.displayName,
        });
      }
      return profile;
    }
    const displayName = user.displayName || "パートナー";
    const fresh: UserProfile = {
      displayName,
      email: user.email || "",
      nickname: displayName,
      coupleId: null,
      themeId: "sakura",
      createdAt: new Date(),
    };
    await setDoc(ref, {
      ...fresh,
      createdAt: Timestamp.fromDate(fresh.createdAt),
    });
    return fresh;
  }, []);

  useEffect(() => {
    if (preview) return;
    if (!firebaseReady || !auth) {
      setRoute("setup");
      return;
    }

    let active = true;
    let unsubAuth = () => {};

    const boot = async () => {
      const firebaseAuth = auth!;
      if (returningFromAuthRedirect()) {
        setRoute("loading");
      }

      try {
        await getRedirectResult(firebaseAuth);
      } catch (err) {
        if (!active) return;
        const message = authErrorMessage(err);
        if (!message.includes("popup-closed")) {
          setError(`ログインに失敗しました: ${message}`);
        }
      }

      if (!active) return;

      unsubAuth = onAuthStateChanged(firebaseAuth, async (user) => {
        setUid(user?.uid ?? null);
        if (!user || !db) {
          setProfile(null);
          setCouple(null);
          setDates([]);
          setRoute("signedOut");
          return;
        }
        try {
          const ensured = await ensureUser(user);
          if (ensured) {
            setProfile(ensured);
            setThemeId(ensured.themeId);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "ログインに失敗しました");
          setRoute("signedOut");
        }
      });
    };

    void boot();

    return () => {
      active = false;
      unsubAuth();
    };
  }, [ensureUser, preview]);

  useEffect(() => {
    if (preview || !uid || !db) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (!snap.exists()) {
        setRoute("signedOut");
        return;
      }
      const data = snap.data();
      const next = profileFromData(data);
      setProfile(next);
      setThemeId(next.themeId);
      if (next.coupleId) setRoute("main");
      else {
        setCouple(null);
        setDates([]);
        setRoute("pairing");
      }
    });
    return () => unsub();
  }, [uid, preview]);

  useEffect(() => {
    if (preview || !db || !profile?.coupleId) return;
    const coupleId = profile.coupleId;
    const unsubCouple = onSnapshot(doc(db, "couples", coupleId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setCouple({
        id: snap.id,
        inviteCode: String(data.inviteCode),
        memberIds: (data.memberIds as string[]) ?? [],
        createdAt: toDate(data.createdAt),
      });
    });
    const unsubDates = onSnapshot(
      query(collection(db, "couples", coupleId, "dates"), orderBy("date", "desc")),
      (snap) => {
        setDates(snap.docs.map((item) => planFromDoc(item.id, item.data())));
      },
    );
    return () => {
      unsubCouple();
      unsubDates();
    };
  }, [profile?.coupleId, preview]);

  const performGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase の設定がまだです");
      return;
    }
    setBusy(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      const popupFailed =
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        code === "auth/cancelled-popup-request";

      if (popupFailed && code !== "auth/popup-closed-by-user") {
        try {
          setRoute("loading");
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          setError(authErrorMessage(redirectErr));
        }
      } else if (code !== "auth/popup-closed-by-user") {
        setError(authErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    await performGoogleSignIn();
  };

  const switchAccount = async () => {
    if (preview) {
      await signOut();
      return;
    }
    if (!auth) {
      setError("Firebase の設定がまだです");
      return;
    }
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アカウントを切り替えられませんでした");
      return;
    }
    await performGoogleSignIn();
  };

  const signOut = async () => {
    if (preview) {
      setPreview(false);
      setRoute(firebaseReady ? "signedOut" : "setup");
      setDates([]);
      setCouple(null);
      setProfile(null);
      return;
    }
    if (auth) await firebaseSignOut(auth);
  };

  const createCouple = async () => {
    if (!uid || !db) return;
    setBusy(true);
    try {
      const code = inviteCode();
      const coupleRef = doc(collection(db, "couples"));
      await setDoc(coupleRef, {
        inviteCode: code,
        memberIds: [uid],
        createdAt: Timestamp.now(),
      });
      await setDoc(doc(db, "inviteCodes", code), {
        coupleId: coupleRef.id,
        createdAt: Timestamp.now(),
      });
      await updateDoc(doc(db, "users", uid), { coupleId: coupleRef.id });
      setTab("settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ペアを作れませんでした");
    } finally {
      setBusy(false);
    }
  };

  const joinCouple = async (raw: string) => {
    if (!uid || !db) return;
    const code = raw.trim().toUpperCase();
    setBusy(true);
    try {
      const invite = await getDoc(doc(db, "inviteCodes", code));
      if (!invite.exists()) throw new Error("その招待コードは見つかりませんでした。");
      const coupleId = String(invite.data().coupleId);
      const coupleSnap = await getDoc(doc(db, "couples", coupleId));
      if (!coupleSnap.exists()) throw new Error("ペア情報が見つかりません。");
      const memberIds = [...((coupleSnap.data().memberIds as string[]) ?? [])];
      if (memberIds.includes(uid)) {
        await updateDoc(doc(db, "users", uid), { coupleId });
        return;
      }
      if (memberIds.length >= 2) {
        throw new Error(
          "すでに2人つながっています。別のGoogleアカウントでログインしている場合は、設定からアカウントを切り替えてください。",
        );
      }
      memberIds.push(uid);
      await updateDoc(doc(db, "couples", coupleId), { memberIds });
      await updateDoc(doc(db, "users", uid), { coupleId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "参加できませんでした");
    } finally {
      setBusy(false);
    }
  };

  const leaveCouple = async () => {
    if (preview) {
      await signOut();
      return;
    }
    if (!uid || !db || !couple) return;
    setBusy(true);
    try {
      const remaining = couple.memberIds.filter((id) => id !== uid);
      await updateDoc(doc(db, "users", uid), { coupleId: deleteField() });
      if (remaining.length === 0) {
        const datesSnap = await getDocs(collection(db, "couples", couple.id, "dates"));
        await Promise.all(datesSnap.docs.map((item) => deleteDoc(item.ref)));
        await deleteDoc(doc(db, "inviteCodes", couple.inviteCode));
        await deleteDoc(doc(db, "couples", couple.id));
      } else {
        await updateDoc(doc(db, "couples", couple.id), { memberIds: remaining });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "解除できませんでした");
    } finally {
      setBusy(false);
    }
  };

  const setTheme = async (id: ThemeId) => {
    setThemeId(id);
    if (preview || !uid || !db) return;
    await updateDoc(doc(db, "users", uid), { themeId: id });
  };

  const updateNickname = async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("ニックネームを入力してください");
      return;
    }
    setProfile((current) => (current ? { ...current, nickname: trimmed } : current));
    if (preview || !uid || !db) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "users", uid), { nickname: trimmed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ニックネームを保存できませんでした");
    } finally {
      setBusy(false);
    }
  };

  const saveDate = async (plan: DatePlan) => {
    if (preview) {
      setDates((current) => {
        const exists = current.some((item) => item.id === plan.id);
        const next = { ...plan, updatedAt: new Date() };
        return exists
          ? current.map((item) => (item.id === plan.id ? next : item))
          : [next, ...current];
      });
      return;
    }
    if (!db || !profile?.coupleId) return;
    const payload = {
      date: Timestamp.fromDate(startOfDay(plan.date)),
      title: plan.title,
      memo: plan.memo,
      destinations: plan.destinations,
      createdAt: Timestamp.fromDate(plan.createdAt),
      updatedAt: Timestamp.now(),
    };
    const col = collection(db, "couples", profile.coupleId, "dates");
    const existing = dates.some((item) => item.id === plan.id);
    if (existing) await setDoc(doc(col, plan.id), payload);
    else await addDoc(col, payload);
  };

  const deleteDate = async (plan: DatePlan) => {
    if (preview) {
      setDates((current) => current.filter((item) => item.id !== plan.id));
      return;
    }
    if (!db || !profile?.coupleId) return;
    await deleteDoc(doc(db, "couples", profile.coupleId, "dates", plan.id));
  };

  const enterPreview = () => {
    setPreview(true);
    setProfile({
      displayName: "ゆう",
      email: "preview@example.com",
      nickname: "ゆう",
      coupleId: "preview",
      themeId: "sakura",
      createdAt: new Date(),
    });
    setCouple({
      id: "preview",
      inviteCode: "HONEY1",
      memberIds: ["preview-1", "preview-2"],
      createdAt: new Date(),
    });
    setDates(samplePlans);
    setThemeId("sakura");
    setRoute("main");
  };

  const value: AppState = {
    route,
    tab,
    themeId,
    profile,
    couple,
    dates,
    error,
    busy,
    preview,
    firebaseReady,
    nextDate,
    sortedDates,
    setTab,
    setError,
    signInWithGoogle,
    switchAccount,
    signOut,
    createCouple,
    joinCouple,
    leaveCouple,
    setTheme,
    updateNickname,
    saveDate,
    deleteDate,
    datesOn,
    enterPreview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
