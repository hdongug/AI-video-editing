import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Play, Sparkles, Download, Mic, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: videoFiles } = trpc.videoFiles.list.useQuery({ projectId });
  const { data: aiAnalyses, refetch: refetchAnalyses } = trpc.aiAnalysis.list.useQuery({ projectId });
  const { data: ttsAudios, refetch: refetchTts } = trpc.tts.list.useQuery({ projectId });
  
  const analyzeMutation = trpc.aiAnalysis.analyze.useMutation();
  const generateThumbnailMutation = trpc.aiAnalysis.generateThumbnail.useMutation();
  const generateTtsMutation = trpc.tts.generateTTS.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [generatingTts, setGeneratingTts] = useState(false);
  const [ttsText, setTtsText] = useState("");
  const [activeTab, setActiveTab] = useState("edit");

  const handleAnalyze = async () => {
    if (!originalVideo) {
      toast.error("분석할 영상이 없습니다.");
      return;
    }

    setAnalyzing(true);
    try {
      await analyzeMutation.mutateAsync({
        projectId,
        videoFileId: originalVideo.id,
      });
      await refetchAnalyses();
      toast.success("AI 분석이 완료되었습니다!");
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast.error("AI 분석에 실패했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!originalVideo) {
      toast.error("썸네일을 생성할 영상이 없습니다.");
      return;
    }

    setGeneratingThumbnail(true);
    try {
      const result = await generateThumbnailMutation.mutateAsync({
        projectId,
        videoFileId: originalVideo.id,
      });
      toast.success("AI 썸네일이 생성되었습니다!");
      
      // Open thumbnail in new tab
      if (result.thumbnailUrl) {
        window.open(result.thumbnailUrl, "_blank");
      }
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
      toast.error("썸네일 생성에 실패했습니다.");
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  const handleGenerateTts = async () => {
    if (!ttsText.trim()) {
      toast.error("TTS로 변환할 텍스트를 입력해주세요.");
      return;
    }

    setGeneratingTts(true);
    try {
      await generateTtsMutation.mutateAsync({
        projectId,
        text: ttsText,
        voice: "default",
      });
      await refetchTts();
      toast.success("TTS 음성이 생성되었습니다!");
      setTtsText("");
    } catch (error) {
      console.error("TTS generation failed:", error);
      toast.error("TTS 생성에 실패했습니다.");
    } finally {
      setGeneratingTts(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId });
      toast.success("프로젝트가 삭제되었습니다.");
      setLocation("/dashboard");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("프로젝트 삭제에 실패했습니다.");
    }
  };

  const handleExport = () => {
    if (!originalVideo?.fileUrl) {
      toast.error("내보낼 영상이 없습니다.");
      return;
    }

    // Download the video file
    const link = document.createElement("a");
    link.href = originalVideo.fileUrl;
    link.download = originalVideo.fileName || "video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("영상 다운로드를 시작합니다.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-background">
        <div className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background grid-background">
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">프로젝트를 찾을 수 없습니다</h2>
          <Link href="/dashboard">
            <Button>대시보드로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const originalVideo = videoFiles?.find(f => f.fileType === "original");
  const latestAnalysis = aiAnalyses?.[0];

  return (
    <div className="min-h-screen bg-background grid-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  대시보드
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold">{project.title}</h1>
                <div className="label-tech">{project.status.toUpperCase()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={!originalVideo}>
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 프로젝트와 관련된 모든 데이터(영상 파일, AI 분석 결과, TTS 오디오)가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>영상 미리보기</CardTitle>
                <CardDescription>업로드된 원본 영상을 재생합니다</CardDescription>
              </CardHeader>
              <CardContent>
                {originalVideo ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={originalVideo.fileUrl}
                    >
                      브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>업로드된 영상이 없습니다</p>
                    </div>
                  </div>
                )}
                
                {originalVideo && (
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="label-tech">파일명</div>
                      <div className="font-mono text-xs truncate">{originalVideo.fileName}</div>
                    </div>
                    <div>
                      <div className="label-tech">해상도</div>
                      <div className="font-mono">{originalVideo.width} × {originalVideo.height}</div>
                    </div>
                    <div>
                      <div className="label-tech">길이</div>
                      <div className="font-mono">{Math.floor(originalVideo.duration || 0)}초</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>AI 분석 결과</CardTitle>
                <CardDescription>LLM이 영상을 분석한 결과입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <Label>분석 요약</Label>
                      <div className="mt-2 p-4 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{(latestAnalysis.result as any)?.summary || 'AI 분석 결과가 없습니다.'}</p>
                      </div>
                    </div>
                    
                    {(latestAnalysis.result as any)?.recommendations && (
                      <div>
                        <Label>편집 추천</Label>
                        <div className="mt-2 p-4 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{(latestAnalysis.result as any).recommendations}</p>
                        </div>
                      </div>
                    )}
                    
                    {(latestAnalysis.result as any)?.thumbnailUrl && (
                      <div>
                        <Label>생성된 썸네일</Label>
                        <div className="mt-2">
                          <img
                            src={(latestAnalysis.result as any).thumbnailUrl}
                            alt="AI Generated Thumbnail"
                            className="rounded-lg max-w-sm border border-border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>아직 AI 분석이 수행되지 않았습니다</p>
                    <p className="text-sm mt-1">오른쪽 패널에서 AI 분석을 시작하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TTS Audio List */}
            {ttsAudios && ttsAudios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>생성된 TTS 음성</CardTitle>
                  <CardDescription>텍스트에서 변환된 음성 파일들</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ttsAudios.map((audio) => (
                      <div key={audio.id} className="p-4 border border-border rounded-lg">
                        <p className="text-sm mb-2 text-muted-foreground">{audio.text}</p>
                        <audio controls className="w-full">
                          <source src={audio.fileUrl} type="audio/mpeg" />
                          브라우저가 오디오 재생을 지원하지 않습니다.
                        </audio>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Tools */}
          <div className="space-y-6">
            {/* AI Tools */}
            <Card>
              <CardHeader>
                <CardTitle>AI 도구</CardTitle>
                <CardDescription>AI 기반 편집 도구</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !originalVideo}
                  className="w-full"
                  variant="outline"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI 영상 분석
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateThumbnail}
                  disabled={generatingThumbnail || !originalVideo}
                  className="w-full"
                  variant="outline"
                >
                  {generatingThumbnail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      AI 썸네일 생성
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* TTS Tool */}
            <Card>
              <CardHeader>
                <CardTitle>TTS 음성 생성</CardTitle>
                <CardDescription>텍스트를 음성으로 변환</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tts-text">변환할 텍스트</Label>
                  <Textarea
                    id="tts-text"
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="음성으로 변환할 텍스트를 입력하세요..."
                    rows={4}
                    disabled={generatingTts}
                  />
                </div>

                <Button
                  onClick={handleGenerateTts}
                  disabled={generatingTts || !ttsText.trim()}
                  className="w-full"
                >
                  {generatingTts ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      음성 생성
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="label-tech">상태</div>
                  <div className="font-mono">{project.status}</div>
                </div>
                <div>
                  <div className="label-tech">생성일</div>
                  <div className="font-mono">{new Date(project.createdAt).toLocaleString("ko-KR")}</div>
                </div>
                <div>
                  <div className="label-tech">수정일</div>
                  <div className="font-mono">{new Date(project.updatedAt).toLocaleString("ko-KR")}</div>
                </div>
                {project.description && (
                  <div>
                    <div className="label-tech">설명</div>
                    <div className="text-muted-foreground">{project.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
