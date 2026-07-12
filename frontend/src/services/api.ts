const API_URL = `http://${window.location.hostname}:8000/api/v1`;

export const api = {
  // Profiles
  getProfiles: async () => {
    const res = await fetch(`${API_URL}/profiles`);
    return res.json();
  },
  createProfile: async (data: any) => {
    const res = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteProfile: async (profileId: number) => {
    const res = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Pages
  getPages: async (profileId: number) => {
    const res = await fetch(`${API_URL}/profiles/${profileId}/pages`);
    return res.json();
  },
  createPage: async (profileId: number, data: any) => {
    const res = await fetch(`${API_URL}/pages?profile_id=${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deletePage: async (pageId: number) => {
    const res = await fetch(`${API_URL}/pages/${pageId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Buttons
  getButtons: async (pageId: number) => {
    const res = await fetch(`${API_URL}/pages/${pageId}/buttons`);
    return res.json();
  },
  createButton: async (pageId: number, data: any) => {
    const res = await fetch(`${API_URL}/buttons?page_id=${pageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateButton: async (buttonId: number, data: any) => {
    const res = await fetch(`${API_URL}/buttons/${buttonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteButton: async (buttonId: number) => {
    const res = await fetch(`${API_URL}/buttons/${buttonId}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  
  // Actions
  getActions: async (buttonId: number) => {
    const res = await fetch(`${API_URL}/buttons/${buttonId}/actions`);
    return res.json();
  },
  createAction: async (buttonId: number, data: any) => {
    const res = await fetch(`${API_URL}/actions?button_id=${buttonId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateAction: async (actionId: number, data: any) => {
    const res = await fetch(`${API_URL}/actions/${actionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteAction: async (actionId: number) => {
    const res = await fetch(`${API_URL}/actions/${actionId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Devices
  getDevices: async () => {
    const res = await fetch(`${API_URL}/devices`);
    return res.json();
  },
  approveDevice: async (uuid: string) => {
    const res = await fetch(`${API_URL}/devices/approve?device_uuid=${uuid}`, {
      method: 'POST'
    });
    return res.json();
  },

  // System
  getSystemApps: async () => {
    const res = await fetch(`${API_URL}/system/apps`);
    return res.json();
  }
};
