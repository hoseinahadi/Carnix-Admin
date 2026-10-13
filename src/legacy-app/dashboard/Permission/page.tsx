import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, CircularProgress, Alert, Chip,
  TextField, InputAdornment, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { AppDispatch } from '../../../../redux/store';
import {
  fetchProjectStructure,
  fetchRolePermissions,
  updateRolePermissions
} from '../../../../redux/features/Permission/PermissionThunks';
import {
  selectProjectStructure,
  selectRolePermissions,
  selectPermissionLoading,
  selectPermissionError,
  clearRolePermissions
} from '../../../../redux/features/Permission/PermissionSlice';
import styles from './PermissionManagement.module.scss';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = {
  SUPER_ADMIN: 6,
  ADMIN: 7,
  MANAGER: 8,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Action {
  projectActionId: number;
  actionName: string;
  httpMethod: string;
  route: string;
  description: string;
  isSensitive: boolean;
  requiresAuthentication: boolean;
}

interface Controller {
  projectControllerId: number;
  controllerName: string;
  moduleName: string;
  description: string;
  baseRoute: string;
  actions: Action[];
}

export interface PermissionItem {
  ProjectActionId: number;
  IsAccess: boolean;
}

export interface PermissionUpdateDto {
  RoleId: number;
  Permissions: PermissionItem[];
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const AREA_COLORS = [
  '#2563eb', '#dc2626', '#059669', '#d97706',
  '#7c3aed', '#e11d48', '#0284c7', '#0d9488',
  '#ea580c', '#0891b2', '#9333ea', '#16a34a'
];

const METHOD_COLOR: Record<string, string> = {
  GET:    '#059669',
  POST:   '#2563eb',
  PUT:    '#d97706',
  DELETE: '#dc2626',
  PATCH:  '#7c3aed',
};

function getMethodColor(m: string) {
  return METHOD_COLOR[m?.toUpperCase()] ?? '#64748b';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number, r: number,
  startDeg: number, endDeg: number,
  gap = 3
) {
  const s     = polarToXY(cx, cy, r, startDeg + gap);
  const e     = polarToXY(cx, cy, r, endDeg   - gap);
  const large = (endDeg - startDeg - gap * 2) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// ─── Single Controller Donut ──────────────────────────────────────────────────
interface DonutProps {
  controller: Controller;
  color: string;
  selectedActions: Record<string, boolean>;
  onToggle: (actionId: number) => void;
}

const ControllerDonut: React.FC<DonutProps> = ({
  controller,
  color,
  selectedActions,
  onToggle
}) => {
  const SIZE     = 300;
  const CX       = SIZE / 2;
  const CY       = SIZE / 2;
  const R_OUTER  = 125;
  const R_INNER  = 75;
  const STROKE_W = R_OUTER - R_INNER;

  const actions  = controller.actions ?? [];
  const count    = actions.length;
  const sliceDeg = count > 0 ? 360 / count : 360;

  const selectedCount = actions.filter(
    a => selectedActions[`${a.projectActionId}`]
  ).length;
  const percent = count > 0 ? Math.round((selectedCount / count) * 100) : 0;

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Box className={styles.donutWrapper}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        overflow="visible"
      >
        <defs>
          <radialGradient
            id={`bg-${controller.projectControllerId}`}
            cx="50%" cy="50%" r="50%"
          >
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </radialGradient>
        </defs>

        <circle
          cx={CX} cy={CY} r={R_OUTER + 10}
          fill={`url(#bg-${controller.projectControllerId})`}
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.2}
        />
        <circle
          cx={CX} cy={CY}
          r={(R_OUTER + R_INNER) / 2}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={STROKE_W}
          strokeOpacity={0.3}
        />

        {count === 0 && (
          <text
            x={CX} y={CY - 30}
            textAnchor="middle"
            fontSize={13}
            fill="#64748b"
            fontWeight={500}
          >
            بدون اکشن
          </text>
        )}

        {actions.map((action, idx) => {
          const start      = idx * sliceDeg;
          const end        = start + sliceDeg;
          const mid        = (start + end) / 2;
          const isSelected = !!selectedActions[`${action.projectActionId}`];
          const isHovered  = hovered === action.projectActionId;
          const segColor   = isSelected
            ? getMethodColor(action.httpMethod)
            : '#cbd5e1';
          const segR = (R_OUTER + R_INNER) / 2;

          const labelPt = polarToXY(CX, CY, segR, mid);
          const dotPt   = polarToXY(CX, CY, R_OUTER + 18, mid);

          return (
            <g
              key={action.projectActionId}
              onClick={() => onToggle(action.projectActionId)}
              onMouseEnter={() => setHovered(action.projectActionId)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {(isSelected || isHovered) && (
                <path
                  d={arcPath(CX, CY, segR, start, end, 2)}
                  fill="none"
                  stroke={
                    isSelected
                      ? getMethodColor(action.httpMethod)
                      : '#2563eb'
                  }
                  strokeWidth={STROKE_W + 16}
                  strokeOpacity={0.15}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              <path
                d={arcPath(CX, CY, segR, start, end, 3)}
                fill="none"
                stroke={
                  isHovered && !isSelected ? '#94a3b8' : segColor
                }
                strokeWidth={
                  isHovered || isSelected ? STROKE_W - 2 : STROKE_W - 5
                }
                strokeLinecap="round"
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />

              {isSelected && (
                <circle
                  cx={dotPt.x} cy={dotPt.y} r={6}
                  fill={getMethodColor(action.httpMethod)}
                  style={{
                    filter: `drop-shadow(0 0 6px ${getMethodColor(action.httpMethod)})`
                  }}
                />
              )}

              {count <= 14 && (
                <text
                  x={labelPt.x} y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={count > 8 ? 9 : 11}
                  fill={isSelected ? '#1e293b' : '#64748b'}
                  fontWeight={isSelected ? 700 : 500}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: 'fill 0.2s'
                  }}
                >
                  {action.actionName.length > 8
                    ? action.actionName.slice(0, 7) + '…'
                    : action.actionName}
                </text>
              )}
            </g>
          );
        })}

        <circle
          cx={CX} cy={CY} r={R_INNER - 5}
          fill="#ffffff"
          stroke={color}
          strokeWidth={2.5}
          strokeOpacity={0.4}
        />
        <text
          x={CX} y={CY - 14}
          textAnchor="middle"
          fontSize={30}
          fontWeight={800}
          fill={color}
          style={{ userSelect: 'none' }}
        >
          {percent}%
        </text>
        <text
          x={CX} y={CY + 14}
          textAnchor="middle"
          fontSize={13}
          fill="#64748b"
          fontWeight={600}
          style={{ userSelect: 'none' }}
        >
          {selectedCount} از {count}
        </text>

        {hovered !== null && (() => {
          const act = actions.find(a => a.projectActionId === hovered);
          if (!act) return null;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={CX - 80} y={SIZE - 35}
                width={160} height={28}
                rx={8}
                fill="#ffffff"
                stroke={getMethodColor(act.httpMethod)}
                strokeWidth={2}
                filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
              />
              <text
                x={CX} y={SIZE - 16}
                textAnchor="middle"
                fontSize={11}
                fill={getMethodColor(act.httpMethod)}
                fontWeight={700}
              >
                {act.actionName} [{act.httpMethod?.toUpperCase()}]
              </text>
            </g>
          );
        })()}
      </svg>
    </Box>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
type FilterMode = 'all' | 'selected' | 'unselected';

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  filter: FilterMode;
  onFilter: (v: FilterMode) => void;
  methodFilter: string;
  onMethodFilter: (v: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search, onSearch,
  filter, onFilter,
  methodFilter, onMethodFilter
}) => (
  <Box className={styles.filterBar}>
    <TextField
      value={search}
      onChange={e => onSearch(e.target.value)}
      placeholder="جستجوی اکشن یا کنترلر یا ماژول..."
      size="small"
      className={styles.searchInput}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#2563eb', fontSize: 22 }} />
          </InputAdornment>
        )
      }}
    />

    <Box className={styles.filterGroup}>
      <FilterListIcon sx={{ color: '#64748b', fontSize: 20 }} />
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && onFilter(v)}
        size="small"
        className={styles.toggleGroup}
      >
        <ToggleButton value="all"        className={styles.toggleBtn}>همه</ToggleButton>
        <ToggleButton value="selected"   className={styles.toggleBtn}>دارای دسترسی</ToggleButton>
        <ToggleButton value="unselected" className={styles.toggleBtn}>بدون دسترسی</ToggleButton>
      </ToggleButtonGroup>
    </Box>

    <Box className={styles.filterGroup}>
      {['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
        <Chip
          key={m}
          label={m}
          size="small"
          onClick={() => onMethodFilter(m)}
          className={styles.methodChip}
          style={{
            background: methodFilter === m
              ? m === 'ALL' ? '#2563eb' : getMethodColor(m)
              : '#f1f5f9',
            color:  methodFilter === m ? '#fff' : '#64748b',
            border: `1.5px solid ${
              methodFilter === m
                ? m === 'ALL' ? '#2563eb' : getMethodColor(m)
                : '#e2e8f0'
            }`,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '11px'
          }}
        />
      ))}
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PermissionManagement: React.FC = () => {
  const { roleId }     = useParams<{ roleId: string }>();
  const targetRoleId   = Number(roleId);
  const navigate       = useNavigate();
  const dispatch       = useDispatch<AppDispatch>();

  const currentRoleId  = Number(localStorage.getItem('RoleId') || '0');

  const hasAccess = useMemo(() => {
    if (!currentRoleId || !targetRoleId) return false;
    if (currentRoleId === ROLES.SUPER_ADMIN) return true;
    if (currentRoleId === ROLES.ADMIN)
      return targetRoleId !== ROLES.SUPER_ADMIN;
    if (currentRoleId === ROLES.MANAGER)
      return (
        targetRoleId !== ROLES.SUPER_ADMIN &&
        targetRoleId !== ROLES.ADMIN
      );
    return currentRoleId === targetRoleId;
  }, [currentRoleId, targetRoleId]);

  const projectStructure = (useSelector(selectProjectStructure) ?? []) as Controller[];
  const rolePermissions  =  useSelector(selectRolePermissions)  ?? [];
  const loading          =  useSelector(selectPermissionLoading);
  const error            =  useSelector(selectPermissionError);

  const [selectedActions, setSelectedActions] = useState<Record<string, boolean>>({});
  const [search,          setSearch         ] = useState('');
  const [filterMode,      setFilterMode     ] = useState<FilterMode>('all');
  const [methodFilter,    setMethodFilter   ] = useState('ALL');

  // ─── نگه داشتن وضعیت اولیه برای مقایسه و پیدا کردن تغییرات ───────────────
  const originalStateRef = useRef<Record<string, boolean>>({});
  // ─── نگه داشتن تغییرات pending ───────────────────────────────────────────
  const [dirtyActions, setDirtyActions] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (targetRoleId && hasAccess) {
      dispatch(fetchProjectStructure(targetRoleId));
      dispatch(fetchRolePermissions(targetRoleId));
    }
    return () => {
      dispatch(clearRolePermissions());
    };
  }, [dispatch, targetRoleId, hasAccess]);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    rolePermissions.forEach((p: any) => {
      // سازگاری با هر دو حالت isAccess و IsAccess
      const isAccess = p?.isAccess ?? p?.IsAccess ?? false;
      if (p?.projectActionId != null) {
        init[`${p.projectActionId}`] = isAccess;
      } else if (p?.ProjectActionId != null) {
        init[`${p.ProjectActionId}`] = isAccess;
      }
    });

    setSelectedActions(init);
    // ذخیره وضعیت اولیه برای مقایسه بعدی
    originalStateRef.current = { ...init };
    // پاک کردن dirty list هنگام لود مجدد
    setDirtyActions(new Map());
  }, [rolePermissions]);

  // ─── Toggle یک اکشن و track کردن تغییر ───────────────────────────────────
  const handleToggle = useCallback((actionId: number) => {
    const key = `${actionId}`;

    setSelectedActions(prev => {
      const newValue = !prev[key];

      // بررسی آیا به مقدار اولیه برگشته یا نه
      setDirtyActions(prevDirty => {
        const next = new Map(prevDirty);
        const originalValue = originalStateRef.current[key] ?? false;

        if (newValue === originalValue) {
          // برگشت به مقدار اولیه → از dirty حذف کن
          next.delete(key);
        } else {
          // تغییر واقعی → به dirty اضافه کن
          next.set(key, newValue);
        }
        return next;
      });

      return { ...prev, [key]: newValue };
    });
  }, []);

  // ─── Toggle همه اکشن‌های یک کنترلر ──────────────────────────────────────
  const handleToggleAllController = useCallback((controller: Controller) => {
    const actions     = controller.actions ?? [];
    const allSelected = actions.every(
      a => selectedActions[`${a.projectActionId}`]
    );
    const newValue = !allSelected;

    setSelectedActions(prev => {
      const updates: Record<string, boolean> = {};
      actions.forEach(a => {
        updates[`${a.projectActionId}`] = newValue;
      });
      return { ...prev, ...updates };
    });

    setDirtyActions(prev => {
      const next = new Map(prev);
      actions.forEach(a => {
        const key = `${a.projectActionId}`;
        const originalValue = originalStateRef.current[key] ?? false;

        if (newValue === originalValue) {
          next.delete(key);
        } else {
          next.set(key, newValue);
        }
      });
      return next;
    });
  }, [selectedActions]);

  // ─── Toggle همه اکشن‌ها ──────────────────────────────────────────────────
  const handleToggleAll = useCallback(() => {
    const allActions  = projectStructure.flatMap(c => c.actions ?? []);
    const allSelected = allActions.every(
      a => selectedActions[`${a.projectActionId}`]
    );
    const newValue = !allSelected;

    setSelectedActions(prev => {
      const updates: Record<string, boolean> = {};
      allActions.forEach(a => {
        updates[`${a.projectActionId}`] = newValue;
      });
      return { ...prev, ...updates };
    });

    setDirtyActions(prev => {
      const next = new Map(prev);
      allActions.forEach(a => {
        const key = `${a.projectActionId}`;
        const originalValue = originalStateRef.current[key] ?? false;

        if (newValue === originalValue) {
          next.delete(key);
        } else {
          next.set(key, newValue);
        }
      });
      return next;
    });
  }, [projectStructure, selectedActions]);

  // ─── Save فقط تغییرات ────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!targetRoleId || dirtyActions.size === 0) return;

    // فقط اکشن‌هایی که واقعاً تغییر کردن
    const perms: PermissionItem[] = Array.from(dirtyActions.entries()).map(
      ([actionId, isAccess]) => ({
        ProjectActionId: Number(actionId),
        IsAccess: isAccess,
      })
    );

    console.log(`ارسال ${perms.length} تغییر از ${
      projectStructure.flatMap(c => c.actions ?? []).length
    } اکشن کل`);

    dispatch(
      updateRolePermissions({ RoleId: targetRoleId, Permissions: perms })
    ).then(result => {
      if (updateRolePermissions.fulfilled.match(result)) {
        // بعد از ذخیره موفق، وضعیت اولیه رو آپدیت کن
        originalStateRef.current = { ...selectedActions };
        setDirtyActions(new Map());
      }
    });
  }, [targetRoleId, dirtyActions, dispatch, selectedActions, projectStructure]);

  const { total, selected } = useMemo(() => {
    let t = 0, s = 0;
    projectStructure.forEach(ctrl => {
      t += ctrl.actions?.length ?? 0;
      s += ctrl.actions?.filter(
        a => selectedActions[`${a.projectActionId}`]
      ).length ?? 0;
    });
    return { total: t, selected: s };
  }, [projectStructure, selectedActions]);

  const overallPct = total > 0 ? Math.round((selected / total) * 100) : 0;

  const filteredStructure = useMemo<Controller[]>(() => {
    const q           = search.trim().toLowerCase();
    const isFiltering = q !== '' || methodFilter !== 'ALL' || filterMode !== 'all';

    return projectStructure
      .map(ctrl => {
        const filteredActions = (ctrl.actions ?? []).filter(action => {
          const matchSearch =
            !q ||
            action.actionName.toLowerCase().includes(q) ||
            ctrl.controllerName.toLowerCase().includes(q) ||
            (ctrl.moduleName ?? '').toLowerCase().includes(q);

          const matchMethod =
            methodFilter === 'ALL' ||
            action.httpMethod?.toUpperCase() === methodFilter;

          const isSel      = !!selectedActions[`${action.projectActionId}`];
          const matchFilter =
            filterMode === 'all'        ? true :
            filterMode === 'selected'   ? isSel : !isSel;

          return matchSearch && matchMethod && matchFilter;
        });

        return { ...ctrl, actions: filteredActions };
      })
      .filter(ctrl =>
        isFiltering
          ? ctrl.actions.length > 0 ||
            ctrl.controllerName.toLowerCase().includes(q) ||
            (ctrl.moduleName ?? '').toLowerCase().includes(q)
          : true
      );
  }, [projectStructure, search, filterMode, methodFilter, selectedActions]);

  if (!hasAccess) {
    return (
      <Box
        className={styles.page}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <SecurityIcon sx={{ fontSize: 90, color: '#dc2626', mb: 2 }} />
        <Typography variant="h4" sx={{ color: '#1e293b', mb: 2, fontWeight: 700 }}>
          عدم دسترسی
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4, fontSize: 15 }}>
          شما به دلیل سطح نقش کاربری خود، اجازه مشاهده و ویرایش دسترسی‌های این نقش را ندارید.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ background: '#2563eb', fontSize: 14, fontWeight: 600 }}
        >
          بازگشت به صفحه قبل
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.page}>
      <Box className={styles.topBar}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          className={styles.backBtn}
        >
          بازگشت
        </Button>

        <Typography variant="h5" className={styles.title}>
          مدیریت دسترسی‌ها
        </Typography>

        <Box className={styles.headerRight}>
          <Chip
            label={`${selected} / ${total}  •  ${overallPct}%`}
            className={styles.statsChip}
          />

          {/* نمایش تعداد تغییرات pending */}
          {dirtyActions.size > 0 && (
            <Chip
              label={`${dirtyActions.size} تغییر`}
              size="small"
              style={{
                background: '#f59e0b15',
                color: '#d97706',
                border: '1.5px solid #f59e0b40',
                fontWeight: 700,
                fontSize: '12px',
                marginLeft: 8
              }}
            />
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={handleToggleAll}
            sx={{
              color: '#64748b',
              borderColor: '#cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              mx: 1
            }}
          >
            {projectStructure.flatMap(c => c.actions ?? []).every(
              a => selectedActions[`${a.projectActionId}`]
            )
              ? 'حذف همه دسترسی‌ها'
              : 'انتخاب همه دسترسی‌ها'
            }
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            className={styles.saveBtn}
            disabled={loading || dirtyActions.size === 0}
          >
            {loading
              ? <CircularProgress size={20} color="inherit" />
              : dirtyActions.size > 0
                ? `ذخیره (${dirtyActions.size})`
                : 'ذخیره'
            }
          </Button>
        </Box>
      </Box>

      <FilterBar
        search={search}       onSearch={setSearch}
        filter={filterMode}   onFilter={setFilterMode}
        methodFilter={methodFilter} onMethodFilter={setMethodFilter}
      />

      {loading && !projectStructure.length ? (
        <Box className={styles.centerBox}>
          <CircularProgress style={{ color: '#2563eb' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      ) : filteredStructure.length === 0 ? (
        <Box className={styles.centerBox}>
          <Typography style={{ color: '#64748b', fontSize: 17, fontWeight: 500 }}>
            نتیجه‌ای یافت نشد
          </Typography>
        </Box>
      ) : (
        <Box className={styles.controllersGrid}>
          {filteredStructure.map((ctrl, cIdx) => {
            const ctrlColor = AREA_COLORS[cIdx % AREA_COLORS.length];
            const ctrlTotal = ctrl.actions?.length ?? 0;
            const ctrlSelected = ctrl.actions?.filter(
              a => selectedActions[`${a.projectActionId}`]
            ).length ?? 0;
            const ctrlPct = ctrlTotal > 0
              ? Math.round((ctrlSelected / ctrlTotal) * 100)
              : 0;
            const allCtrlSelected = ctrlTotal > 0 && ctrlSelected === ctrlTotal;

            return (
              <Box
                key={ctrl.projectControllerId}
                className={styles.controllerCard}
                style={{ borderColor: `${ctrlColor}30` }}
              >
                <Box
                  className={styles.controllerHeader}
                  style={{ borderBottomColor: `${ctrlColor}20` }}
                >
                  <Box className={styles.controllerHeaderLeft}>
                    <Box
                      className={styles.ctrlDot}
                      style={{ background: ctrlColor }}
                    />
                    <Box>
                      <Typography
                        className={styles.ctrlName}
                        style={{ color: ctrlColor }}
                      >
                        {ctrl.controllerName}
                      </Typography>
                      {ctrl.moduleName && (
                        <Typography className={styles.ctrlModule}>
                          {ctrl.moduleName}
                        </Typography>
                      )}
                      {ctrl.baseRoute && (
                        <Typography className={styles.ctrlRoute}>
                          {ctrl.baseRoute}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className={styles.controllerHeaderRight}>
                    <Chip
                      label={`${ctrlPct}%`}
                      size="small"
                      style={{
                        background: `${ctrlColor}15`,
                        color: ctrlColor,
                        border: `1.5px solid ${ctrlColor}40`,
                        fontWeight: 700,
                        marginLeft: 8,
                        fontSize: '12px'
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => handleToggleAllController(ctrl)}
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: allCtrlSelected ? '#dc2626' : ctrlColor,
                        borderColor: allCtrlSelected
                          ? '#dc262630' : `${ctrlColor}30`,
                        border: '1.5px solid',
                        px: 1.5,
                        py: 0.4,
                        minWidth: 'unset',
                        borderRadius: '8px'
                      }}
                    >
                      {allCtrlSelected ? 'حذف همه' : 'انتخاب همه'}
                    </Button>
                  </Box>
                </Box>

                <Box className={styles.donutContainer}>
                  <ControllerDonut
                    controller={ctrl}
                    color={ctrlColor}
                    selectedActions={selectedActions}
                    onToggle={handleToggle}
                  />
                </Box>

                <Box className={styles.actionsList}>
                  {(ctrl.actions ?? []).map(action => {
                    const isSelected =
                      !!selectedActions[`${action.projectActionId}`];
                    const mColor = getMethodColor(action.httpMethod);
                    // آیا این اکشن تغییر کرده؟
                    const isDirty = dirtyActions.has(`${action.projectActionId}`);

                    return (
                      <Box
                        key={action.projectActionId}
                        className={styles.actionRow}
                        onClick={() => handleToggle(action.projectActionId)}
                        style={{
                          background: isSelected
                            ? `${mColor}10`
                            : 'transparent',
                          borderColor: isDirty
                            ? '#f59e0b'
                            : isSelected
                              ? `${mColor}30`
                              : '#e2e8f0',
                          cursor: 'pointer',
                          // نشانه بصری برای ردیف‌های تغییر کرده
                          outline: isDirty ? '1.5px solid #f59e0b40' : 'none',
                        }}
                      >
                        <Box
                          className={styles.methodBadge}
                          style={{
                            background: `${mColor}15`,
                            color: mColor,
                            border: `1.5px solid ${mColor}40`
                          }}
                        >
                          {action.httpMethod?.toUpperCase()}
                        </Box>

                        <Typography
                          className={styles.actionName}
                          style={{ color: isSelected ? '#1e293b' : '#64748b' }}
                        >
                          {action.actionName}
                        </Typography>

                        {action.route && (
                          <Typography className={styles.actionRoute}>
                            {action.route}
                          </Typography>
                        )}

                        {/* نشانه تغییر نشده ذخیره */}
                        {isDirty && (
                          <Chip
                            label="تغییر"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 20,
                              background: '#f59e0b15',
                              color: '#d97706',
                              border: '1.5px solid #f59e0b40',
                              fontWeight: 700,
                              ml: 'auto'
                            }}
                          />
                        )}

                        {!isDirty && action.isSensitive && (
                          <Chip
                            label="حساس"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 20,
                              background: '#dc262615',
                              color: '#dc2626',
                              border: '1.5px solid #dc262630',
                              ml: 'auto',
                              fontWeight: 700
                            }}
                          />
                        )}

                        <Box
                          className={styles.customCheckbox}
                          style={{
                            background: isSelected ? mColor : 'transparent',
                            borderColor: isSelected ? mColor : '#cbd5e1',
                          }}
                        >
                          {isSelected && (
                            <svg
                              width="11" height="11"
                              viewBox="0 0 11 11"
                              fill="none"
                            >
                              <path
                                d="M1.5 5.5L4.5 8.5L9.5 2.5"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PermissionManagement;
