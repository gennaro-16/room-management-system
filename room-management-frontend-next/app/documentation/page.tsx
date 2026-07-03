import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Book, Code, Database, Shield, Rocket } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Room Management System Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive guide for the Room Management Platform
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Complete overview of the Room Management System architecture and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Technology Stack</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Backend</Badge>
                      <span>NestJS + PostgreSQL + Prisma</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Frontend</Badge>
                      <span>Next.js 14 + React 18 + Tailwind CSS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Auth</Badge>
                      <span>JWT + Role-based Access Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Deployment</Badge>
                      <span>Docker + Docker Compose</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Key Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Auto-approval booking system</li>
                    <li>• Real-time conflict detection</li>
                    <li>• Multi-role user management</li>
                    <li>• Department-based organization</li>
                    <li>• Responsive web interface</li>
                    <li>• Real-time notifications</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Default Admin Credentials</h4>
                <div className="bg-background p-3 rounded border">
                  <p><strong>Email:</strong> admin@bank.com</p>
                  <p><strong>Password:</strong> password123</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Database Layer</h3>
                  <p className="text-sm text-muted-foreground">PostgreSQL with Prisma ORM</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Code className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">API Layer</h3>
                  <p className="text-sm text-muted-foreground">NestJS REST API</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Book className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Frontend Layer</h3>
                  <p className="text-sm text-muted-foreground">Next.js React Application</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Booking Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Auto-Approval:</strong> All bookings are automatically approved</li>
                    <li>• <strong>Conflict Detection:</strong> Real-time validation prevents double-booking</li>
                    <li>• <strong>Multi-View Display:</strong> Calendar, Grid, and List views</li>
                    <li>• <strong>Status Tracking:</strong> Pending, Approved, Ongoing, Completed</li>
                    <li>• <strong>Recurring Bookings:</strong> Support for recurring meetings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">User Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Role-Based Access:</strong> Admin, Employee, Guest roles</li>
                    <li>• <strong>User Approval:</strong> Admin approval for new users</li>
                    <li>• <strong>Department Organization:</strong> Users organized by departments</li>
                    <li>• <strong>Profile Management:</strong> User profiles and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Room Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Room Information:</strong> Capacity, amenities, location</li>
                    <li>• <strong>Maintenance Mode:</strong> Mark rooms for maintenance</li>
                    <li>• <strong>Availability Tracking:</strong> Real-time room status</li>
                    <li>• <strong>Department Assignment:</strong> Rooms assigned to departments</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Dashboard & Analytics</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Overview Statistics:</strong> Total rooms, bookings, availability</li>
                    <li>• <strong>Real-time Data:</strong> Live updates and status</li>
                    <li>• <strong>Today's Bookings:</strong> Current day booking overview</li>
                    <li>• <strong>Department Stats:</strong> Department-specific analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Backend API endpoints and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Base URL</h3>
                  <code className="bg-muted px-2 py-1 rounded">http://localhost:3000</code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-2"><strong>Login:</strong> POST /auth/login</p>
                    <p className="text-sm mb-2"><strong>Register:</strong> POST /auth/register</p>
                    <p className="text-sm"><strong>Profile:</strong> GET /auth/profile</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Main Endpoints</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Bookings</h4>
                      <ul className="text-sm space-y-1">
                        <li>GET /bookings - List all bookings</li>
                        <li>POST /bookings - Create booking</li>
                        <li>PATCH /bookings/:id - Update booking</li>
                        <li>DELETE /bookings/:id - Cancel booking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Rooms</h4>
                      <ul className="text-sm space-y-1">
                        <li>GET /rooms - List all rooms</li>
                        <li>POST /rooms - Create room (Admin)</li>
                        <li>GET /rooms/available - Available rooms</li>
                        <li>PATCH /rooms/:id - Update room</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button asChild>
                    <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test API Endpoints
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>PostgreSQL database structure and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Main Tables</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Users</h4>
                      <p className="text-sm text-muted-foreground">User accounts and profiles</p>
                      <ul className="text-xs mt-1">
                        <li>• id, username, email, role</li>
                        <li>• firstName, lastName, departmentId</li>
                        <li>• isActive, isApproved</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Bookings</h4>
                      <p className="text-sm text-muted-foreground">Room reservations</p>
                      <ul className="text-xs mt-1">
                        <li>• id, title, roomId, organizerId</li>
                        <li>• startTime, endTime, status</li>
                        <li>• purpose, attendees</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Rooms</h4>
                      <p className="text-sm text-muted-foreground">Meeting room information</p>
                      <ul className="text-xs mt-1">
                        <li>• id, name, capacity, floor</li>
                        <li>• amenities, departmentId</li>
                        <li>• isUnderMaintenance</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Departments</h4>
                      <p className="text-sm text-muted-foreground">Organizational units</p>
                      <ul className="text-xs mt-1">
                        <li>• id, name, description</li>
                        <li>• floor, createdAt</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">User Roles</h3>
                  <div className="flex gap-2">
                    <Badge variant="default">ADMIN</Badge>
                    <Badge variant="secondary">EMPLOYEE</Badge>
                    <Badge variant="outline">GUEST</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Booking Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">PENDING</Badge>
                    <Badge variant="default">APPROVED</Badge>
                    <Badge variant="secondary">ONGOING</Badge>
                    <Badge variant="destructive">REJECTED</Badge>
                    <Badge variant="destructive">CANCELLED</Badge>
                    <Badge variant="secondary">COMPLETED</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Docker Deployment
              </CardTitle>
              <CardDescription>Deploy using Docker and Docker Compose</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Quick Start</h3>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-2"><strong>Development:</strong></p>
                    <code className="text-sm">./scripts/dev.sh</code>
                    <p className="text-sm mt-2 mb-2"><strong>Production:</strong></p>
                    <code className="text-sm">./scripts/deploy.sh</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Manual Deployment</h3>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-1"><strong>Development:</strong></p>
                    <code className="text-sm">docker compose up -d</code>
                    <p className="text-sm mt-2 mb-1"><strong>Production:</strong></p>
                    <code className="text-sm">docker compose -f docker-compose.prod.yml up -d</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Frontend</h4>
                      <p className="text-sm">http://localhost:3001</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Backend API</h4>
                      <p className="text-sm">http://localhost:3000</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Database</h4>
                      <p className="text-sm">localhost:5432</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium">Redis</h4>
                      <p className="text-sm">localhost:6379</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-2"><strong>Available Documentation Files:</strong></p>
                    <ul className="text-sm space-y-1">
                      <li>• <code>COMPREHENSIVE_DOCUMENTATION.md</code> - Complete system documentation</li>
                      <li>• <code>DOCKER_DEPLOYMENT.md</code> - Docker deployment guide</li>
                      <li>• <code>API_DOCUMENTATION.md</code> - API reference</li>
                      <li>• <code>USER_GUIDE.md</code> - User manual</li>
                    </ul>
                    <p className="text-sm mt-2 text-muted-foreground">
                      These files are available in the project root directory.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Setup</CardTitle>
              <CardDescription>Get started with development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Prerequisites</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Node.js 18+</li>
                    <li>• PostgreSQL 15+</li>
                    <li>• npm or yarn</li>
                    <li>• Git</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Backend Setup</h3>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-sm block">cd room-management-backend-nest</code>
                    <code className="text-sm block">npm install</code>
                    <code className="text-sm block">npx prisma migrate dev</code>
                    <code className="text-sm block">npx prisma db seed</code>
                    <code className="text-sm block">npm run start:dev</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Frontend Setup</h3>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-sm block">cd room-management-frontend-next</code>
                    <code className="text-sm block">npm install</code>
                    <code className="text-sm block">npm run dev</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Environment Variables</h3>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-1"><strong>Backend (.env):</strong></p>
                    <code className="text-sm block">DATABASE_URL="postgresql://..."</code>
                    <code className="text-sm block">JWT_SECRET="your-secret-key"</code>
                    <p className="text-sm mt-2 mb-1"><strong>Frontend (.env.local):</strong></p>
                    <code className="text-sm block">NEXT_PUBLIC_API_URL="http://localhost:3000"</code>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm mb-2"><strong>Documentation Files Location:</strong></p>
                    <p className="text-sm text-muted-foreground">
                      All documentation files are located in the project root directory and can be accessed directly from the file system.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
