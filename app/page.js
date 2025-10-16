import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Image from 'next/image';

export default function Home() {
  return (
  <>
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#eaf6ff] via-[#f5faff] to-[#e3eafc]">

        <main className="flex-1 p-10 mx-6 my-4">
          <h2 className="text-2xl font-bold mb-6">사용 가이드</h2>
          <hr className="w-full border-t-2 border-[#cce6ff] my-6" />
          <div className="flex flex-col items-start mb-8">
            <Image src="/test.png" alt="CloudMancer Logo" width={400} height={300} className="rounded-lg mb-4 self-center" />
            <p className="text-gray-700 text-left max-w-2xl mb-2">
              CloudMancer는 클라우드 서버 운영을 단순화하는 자동화 관리 플랫폼입니다.<br />
              최초 등록 이후에는 직접 서버에 접속할 필요 없이, 웹을 통해 서버 선택과 관리가 가능합니다.<br />
              <span className="font-semibold">• 보안 강화: 자체 진단 점검과 자동화<br />• 손쉬운 관리: 서버 설치, 점검, 업데이트를 간편하게 수행<br />• 스크립트 등록: 커뮤니티와 공유되는 다양한 자동화 스크립트 사용 가능<br />• 확장성: 다수의 서버를 한 곳에서 통합적으로 관리</span>
            </p>
            <p className="text-gray-600 text-sm text-left">CloudMancer와 함께 빠르고 편리하게 클라우드 서버를 운영하세요.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">1. 사이트 생성</h3>
            <p className="mb-6 text-gray-700">사이트 분할을 통해 조직 단위의 인프라를 체계적으로 제어할 수 있습니다.<br />사이트는 프로젝트 단위, 혹은 CSP 단위, 혹은 개인 기준에 따라 어떠한 기준이든 생성 가능합니다.</p>
            <h3 className="text-xl font-bold mb-4">2. 에이전트 연결</h3>
            <p className="text-gray-700">마스터 서버와의 연결을 진행하고 임포트된 사이트를 통해 모든 서버를 제어할 수 있습니다.</p>
          </div>
        </main>
      </div>
  </>
  );
}
