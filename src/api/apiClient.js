// Local storage-based client — replaces @base44/sdk
// Provides the same interface used throughout the app

const PREFIX = 'vitalpulse_';

function createEntity(entityName) {
  const key = PREFIX + entityName;

  const getAll = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  const saveAll = (items) => {
    localStorage.setItem(key, JSON.stringify(items));
  };

  return {
    list: async (sortField = '-created_date', limit = 100) => {
      let items = getAll();
      const desc = sortField.startsWith('-');
      const field = desc ? sortField.slice(1) : sortField;
      items.sort((a, b) => {
        const av = a[field] ?? '';
        const bv = b[field] ?? '';
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
      return items.slice(0, limit);
    },

    create: async (data) => {
      const items = getAll();
      const newItem = {
        ...data,
        id: crypto.randomUUID(),
        created_date: new Date().toISOString(),
      };
      items.push(newItem);
      saveAll(items);
      return newItem;
    },

    update: async (id, data) => {
      const items = getAll();
      const idx = items.findIndex((i) => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        saveAll(items);
        return items[idx];
      }
      throw new Error('Item not found');
    },

    delete: async (id) => {
      saveAll(getAll().filter((i) => i.id !== id));
    },

    filter: async (query) => {
      return getAll().filter((item) =>
        Object.entries(query).every(([k, v]) => item[k] === v)
      );
    },
  };
}

const USER_KEY = PREFIX + 'user';

const auth = {
  me: async () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  },

  updateMe: async (data) => {
    const current = await auth.me();
    const updated = { ...current, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  logout: () => {
    // In local mode logout just reloads the page
    window.location.href = '/';
  },

  redirectToLogin: () => {
    // No external login in local mode — noop
  },
};

// Integrations stub (AI features not available without Base44)
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Return a local object URL as a stand-in
      const url = URL.createObjectURL(file);
      return { file_url: url };
    },
    ExtractDataFromUploadedFile: async () => {
      // AI extraction is not available in local mode
      return { status: 'error', output: null };
    },
  },
};

export const base44 = {
  entities: {
    BloodPressure: createEntity('BloodPressure'),
    BloodTest: createEntity('BloodTest'),
    BodyMetric: createEntity('BodyMetric'),
    Medication: createEntity('Medication'),
    SymptomLog: createEntity('SymptomLog'),
  },
  auth,
  integrations,
};
