import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Video, Clock, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-background">
        <div className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors">
                Titleist
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="label-tech">{user?.name || user?.email}</div>
              <Link href="/projects/new">
                <Button className="group">
                  <Plus className="mr-2 group-hover:rotate-90 transition-transform" />
                  새 프로젝트
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="label-tech mb-3 text-primary">DASHBOARD</div>
          <h1 className="mb-4">내 프로젝트</h1>
          <p className="text-lg text-muted-foreground">
            AI 기반 영상 편집 프로젝트를 관리하고 새로운 작업을 시작하세요.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                전체 프로젝트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{projects?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                AI 분석 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {projects?.filter(p => p.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                진행 중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {projects?.filter(p => p.status === 'draft' || p.status === 'processing').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">최근 프로젝트</h2>
          
          {!projects || projects.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">아직 프로젝트가 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  첫 번째 영상 편집 프로젝트를 시작해보세요.
                </p>
                <Link href="/projects/new">
                  <Button size="lg">
                    <Plus className="mr-2" />
                    새 프로젝트 만들기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="data-grid">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="card-technical cursor-pointer hover:shadow-lg transition-all group">
                    <CardHeader>
                      {project.thumbnailUrl && (
                        <div className="aspect-video bg-muted rounded mb-4 overflow-hidden">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || '설명 없음'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="label-tech">
                          {project.status === 'draft' && 'DRAFT'}
                          {project.status === 'processing' && 'PROCESSING'}
                          {project.status === 'completed' && 'COMPLETED'}
                          {project.status === 'failed' && 'FAILED'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(project.updatedAt), { 
                            addSuffix: true,
                            locale: ko 
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
