import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { ArrowRight, Sparkles, Video, Wand2, Download, Mic, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Grid Background */}
      <section className="section-blueprint grid-background relative">
        {/* Geometric Accents */}
        <div className="geometric-accent cyan" style={{ top: '10%', left: '5%', width: '200px', height: '200px', transform: 'rotate(15deg)' }} />
        <div className="geometric-accent pink" style={{ bottom: '15%', right: '8%', width: '150px', height: '150px', transform: 'rotate(-20deg)' }} />
        
        {/* Formula Decorations */}
        <div className="formula-decoration absolute top-20 right-20 hidden lg:block animate-formula">
          f(x) = ∫ AI(video) dx
        </div>
        <div className="formula-decoration absolute bottom-32 left-16 hidden lg:block animate-formula" style={{ animationDelay: '2s' }}>
          Σ(quality) → ∞
        </div>

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center py-20">
            <div className="label-tech mb-6 text-primary">
              AI-POWERED VIDEO EDITING PLATFORM
            </div>
            
            <h1 className="mb-8 leading-tight">
              Precision Editing,<br />
              <span className="text-primary">Algorithmic Excellence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              영상 편집의 새로운 패러다임을 경험하세요. 수학적 정밀함과 AI의 창의성이 만나 완벽한 결과물을 만들어냅니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6 group">
                    대시보드로 이동
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8 py-6 group">
                    시작하기
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              )}
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 btn-wireframe">
                <Video className="mr-2" />
                데모 보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <div className="label-tech mb-4 text-primary">CORE CAPABILITIES</div>
            <h2 className="mb-6">기술적 우수성</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              첨단 AI 알고리즘과 직관적인 인터페이스가 결합된 전문가급 편집 도구
            </p>
          </div>

          <div className="data-grid max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-sm">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">AI EDITING</div>
                  <h3 className="text-2xl font-bold mb-3">AI 자동 편집</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    LLM 기반 콘텐츠 분석으로 장면 감지, 하이라이트 추출, 최적의 편집 포인트를 자동으로 추천합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-sm">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">UPSCALING</div>
                  <h3 className="text-2xl font-bold mb-3">화질 향상</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI 업스케일링 기술로 저화질 영상을 고화질로 변환하여 전문적인 품질을 보장합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-sm">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">TIMELINE EDITOR</div>
                  <h3 className="text-2xl font-bold mb-3">타임라인 편집</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    어도비 스타일의 전문 편집 도구로 자르기, 분할, 병합, 트랜지션을 정밀하게 제어합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-sm">
                  <Mic className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">TEXT-TO-SPEECH</div>
                  <h3 className="text-2xl font-bold mb-3">TTS 음성 변환</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    다양한 목소리 옵션으로 텍스트를 자연스러운 음성으로 변환하여 영상에 추가합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-sm">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">EXPORT</div>
                  <h3 className="text-2xl font-bold mb-3">영상 내보내기</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    편집 완료된 영상을 다양한 포맷과 해상도로 렌더링하여 다운로드할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card-technical group hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-sm">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="label-tech mb-2">CLOUD STORAGE</div>
                  <h3 className="text-2xl font-bold mb-3">클라우드 저장</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    원본 영상과 편집 결과물을 안전하게 클라우드에 저장하고 언제든지 접근할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs Section */}
      <section className="section-blueprint blueprint-overlay">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="wireframe-box p-12 bg-card/80 backdrop-blur-sm">
              <div className="label-tech mb-4 text-primary">TECHNICAL SPECIFICATIONS</div>
              <h2 className="mb-8">알고리즘 기반 워크플로우</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="mono text-sm text-primary mb-2">INPUT_PROCESSING</div>
                  <p className="text-muted-foreground leading-relaxed">
                    영상 업로드 시 자동으로 메타데이터를 추출하고 AI가 콘텐츠를 분석하여 최적의 편집 전략을 수립합니다.
                  </p>
                </div>
                
                <div>
                  <div className="mono text-sm text-secondary mb-2">AI_ANALYSIS</div>
                  <p className="text-muted-foreground leading-relaxed">
                    LLM이 영상의 장면, 감정, 리듬을 분석하여 자동 컷 편집과 하이라이트 구간을 추천합니다.
                  </p>
                </div>
                
                <div>
                  <div className="mono text-sm text-primary mb-2">TIMELINE_CONTROL</div>
                  <p className="text-muted-foreground leading-relaxed">
                    프레임 단위의 정밀한 제어와 실행 취소/다시 실행으로 완벽한 편집 히스토리를 관리합니다.
                  </p>
                </div>
                
                <div>
                  <div className="mono text-sm text-secondary mb-2">OUTPUT_RENDER</div>
                  <p className="text-muted-foreground leading-relaxed">
                    고성능 렌더링 엔진으로 빠르고 정확하게 최종 결과물을 생성하여 다운로드할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container text-center">
          <div className="label-tech mb-6 opacity-70">START YOUR PROJECT</div>
          <h2 className="mb-6 text-background">지금 시작하세요</h2>
          <p className="text-xl text-background/80 mb-10 max-w-2xl mx-auto">
            수학적 정밀함과 AI의 창의성이 만나는 영상 편집의 미래를 경험하세요.
          </p>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
                대시보드로 이동
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
                무료로 시작하기
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold mb-2">Titleist</div>
              <div className="label-tech">AI-POWERED VIDEO EDITING PLATFORM</div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 Titleist. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
