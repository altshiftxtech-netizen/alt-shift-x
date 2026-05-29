import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Key, Settings, Globe } from 'lucide-react';
import SharedNav from '@/components/SharedNav';

export default function ApiPartnerDashboard() {
  const [tenants, setTenants] = useState([]);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '', domain: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateTenant = async () => {
    setLoading(true);
    try {
      const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const tenant = await base44.entities.Tenant.create({
        name: newTenant.name,
        slug: newTenant.slug.toLowerCase(),
        api_key: apiKey,
        api_secret: Math.random().toString(36).substring(2),
        branding: {
          company_name: newTenant.name,
          domain: newTenant.domain,
          primary_color: '#000000'
        },
        features_enabled: ['api_access', 'spend_intelligence', 'vendor_scorecards']
      });
      setTenants([...tenants, tenant]);
      setNewTenant({ name: '', slug: '', domain: '' });
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedNav mode="builder" />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">API Partner Portal</h1>
          <p className="text-muted-foreground mt-2">White-label & partner tenant management</p>
        </div>

        {/* Create Tenant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Create New Tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Company Name"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              />
              <Input
                placeholder="Slug (URL-safe)"
                value={newTenant.slug}
                onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
              />
              <Input
                placeholder="Domain"
                value={newTenant.domain}
                onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateTenant} disabled={!newTenant.name || loading}>
              {loading ? 'Creating...' : 'Create Tenant'}
            </Button>
          </CardContent>
        </Card>

        {/* Tenants List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Tenants</h2>
          {tenants.length === 0 ? (
            <p className="text-muted-foreground">No tenants yet. Create one to get started.</p>
          ) : (
            tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{tenant.branding?.company_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tenant.branding?.domain}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tenant.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500" />
                        <code className="text-sm font-mono text-slate-600">{tenant.api_key.substring(0, 20)}...</code>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(tenant.api_key)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm">
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-mono">
            <p><span className="text-green-600">GET</span> /api/v1/vendors</p>
            <p><span className="text-green-600">GET</span> /api/v1/invoices</p>
            <p><span className="text-green-600">GET</span> /api/v1/vendor-scores</p>
            <p><span className="text-green-600">GET</span> /api/v1/spend-analytics</p>
            <p className="text-muted-foreground text-xs mt-4">Header: X-API-Key: {'{tenant.api_key}'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}