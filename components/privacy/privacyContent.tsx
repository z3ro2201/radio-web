import React from "react";
import Image from "next/image";
import Link from "next/link";
import { iconList } from "./privacyIconType";
const PrivacyTitle = ({
  border,
  options,
  text,
  iconName,
}: {
  border: boolean;
  options: boolean;
  text: string;
  iconName: string;
}) => {
  return (
    <div
      className={`px-2 py-3 w-full ${border && "border-r border-gray-300"} flex flex-col items-center justify-center gap-1`}
    >
      <Image src={`/images/privacy/${iconName}.png`} width={65} height={65} alt={text} />
      <span className="block mt-1 text-sm">{text}</span>
      {options && <span className="text-xs">※세부항목은 개인정보 처리방침 본문 확인</span>}
    </div>
  );
};

const PrivacyContentBox = ({ children }: { children: React.ReactNode }) => {
  return <div className="border-t-2 border-t-[#0075bf] border-b border-b-gray-300">{children}</div>;
};

const Title = ({ title }: { title: string }) => {
  return <div className="py-2 bg-[#f2f3f7] text-center font-semibold">{title}</div>;
};

const PrivacyRow = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex border-t border-t-gray-300">{children}</div>;
};

const PrivacyIndexLink = ({ id, text, iconListArray }: { id: number; text: string; iconListArray: string[] }) => {
  return (
    <Link className="py-1 flex items-center" href={`#privacy_index${id}`}>
      <span className="inline-block mr-2 text-sm">
        {id}. {text}
      </span>
      <div className="flex gap-1 items-center">
        {iconListArray &&
          iconListArray.map((iconName, key) => {
            const iconDescription = iconList.find((item) => item?.iconName === iconName)?.description ?? "";
            return (
              <Image src={`/images/privacy/${iconName}.png`} alt={iconDescription} width={24} height={16} key={key} />
            );
          })}
      </div>
    </Link>
  );
};

const Section = ({ id, children }: { id: number; children: React.ReactNode }) => {
  return (
    <div id={`privacy_index${id}`} className="px-2 py-3 text-sm">
      {children}
    </div>
  );
};

const SectionContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-2 flex flex-col gap-1">{children}</div>;
};

interface privacyIndexListProp {
  type: string[];
  icon: string[];
  text: string;
}

const SectionTitle = ({ item }: { item: privacyIndexListProp }) => {
  return (
    <div className="mt-[40px] mb-[14px] pr-[17px] pl-[24px] flex h-[64px] items-center justify-between font-bold text-xl rounded-lg bg-[#ebf1f7]">
      <h1 className="text-[#0044cc]">{item.text}</h1>
      <div className="p-1 flex gap-1 bg-white">
        {item?.icon &&
          item.icon.map((iconName, key) => {
            const icon = iconList.find((item) => item?.iconName === iconName);
            if (icon) return <Image src={icon.iconPath} alt={icon?.description} key={key} width={24} height={24} />;
            return "";
          })}
      </div>
    </div>
  );
};

const Hr = () => {
  return <div className="my-2">&nbsp;</div>;
};

const companyName = "라디오";

const privacyIndexList: privacyIndexListProp[] = [
  { type: ["web", "app"], icon: ["011", "012", "020"], text: "개인정보의 처리 목적, 수집 항목, 보유 및 이용기간" },
  {
    type: ["app"],
    icon: ["005", "014"],
    text: "개인정보 자동 수집 장치 및 제3자(구글)의 행태정보 수집·이용에 관한 사항",
  },
  { type: ["web", "app"], icon: ["022"], text: "개인정보의 파기 절차 및 방법" },
  { type: ["web", "app"], icon: ["028"], text: "정보주체의 권리·의무 및 행사방법" },
  { type: ["web", "app"], icon: ["024"], text: "개인정보의 안전성 확보조치에 관한 사항" },
  { type: ["web", "app"], icon: ["029", "031"], text: "개인정보 보호책임자 및 고충처리 부서" },
  { type: ["web", "app"], icon: ["031"], text: "정보주체의 권익침해에 대한 구제방법" },
  { type: ["web", "app"], icon: ["025"], text: "개인정보 처리방침의 변경에 관한 사항" },
];

export const Privacy = ({ type }: { type: "web" | "app" }) => {
  let row = 0;
  return (
    <>
      <div className="p-2 flex flex-col gap-2 text-sm font-semibold">
        <p>
          {companyName}는 정보주체의 자유와 권리 보호를 위해「개인정보보호법」및 관계 법령이 정한 바를 준수하여,
          적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.
        </p>
        <p>
          이에「개인정보보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한
          고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
      </div>
      <PrivacyContentBox>
        <Title title="【주요 개인정보 처리 표시(라벨링)】" />
        <PrivacyRow>
          <PrivacyTitle text="일반 개인정보 수집" border={true} options={true} iconName="001" />
          <PrivacyTitle text="개인정보 처리목적" border={true} options={true} iconName="012" />
          <PrivacyTitle text="개인정보의 보유 기간" border={false} options={true} iconName="020" />
        </PrivacyRow>
        <PrivacyRow>
          <PrivacyTitle text="개인 위치정보 수집" border={true} options={false} iconName="005" />
          <PrivacyTitle text="개인정보 국외이전" border={true} options={true} iconName="017" />
          <PrivacyTitle text="권익침해 구제방법" border={false} options={false} iconName="032" />
        </PrivacyRow>
        <PrivacyRow>
          <PrivacyTitle text="개인정보의 제공" border={true} options={false} iconName="018" />
          <PrivacyTitle text="처리위탁" border={true} options={false} iconName="019" />
          <PrivacyTitle text="고충처리부서" border={false} options={false} iconName="031" />
        </PrivacyRow>
        <PrivacyRow>
          <PrivacyTitle text="개인정보의 파기 절차 및 방법" border={true} options={false} iconName="022" />
          <PrivacyTitle text="개인정보처리방침의 변경" border={true} options={false} iconName="025" />
        </PrivacyRow>
      </PrivacyContentBox>

      <Hr />

      <PrivacyContentBox>
        <Title title="목차" />
        <p className="p-1 my-2 font-semibold">「개인정보 처리방침」은 다음과 같은 내용으로 구성되어 있습니다.</p>
        <ul className="m-2 p-3 rounded-lg border-2 border-green-200">
          {privacyIndexList.map((item, key) => {
            const isType = item.type.find((types) => types === type);
            if (isType) {
              row++;
              return (
                <li key={key}>
                  <PrivacyIndexLink text={item.text} id={row} iconListArray={item.icon} />
                </li>
              );
            }
          })}
        </ul>
      </PrivacyContentBox>

      <Hr />

      <Section id={1}>
        <SectionTitle item={privacyIndexList[0]} />
        <SectionContent>
          <div>
            1. {companyName} 은(는) 「개인정보 보호법」에 따라 서비스 제공을 위해 필요 최소한의 범위에서 개인정보를
            처리하고 있습니다.
          </div>
          <div>① 정보주체의 동의를 받지 않고 처리하는 개인정보 항목</div>
          <div>
            {companyName} 는 이용자의 별도 동의 없이 서비스 제공 및 계약 이행을 위해 다음의 최소 정보만을 처리합니다.
          </div>
          <table>
            <thead>
              <tr>
                <th>구분/서비스</th>
                <th>처리 목적</th>
                <th>법적 근거</th>
                <th>처리 항목</th>
                <th>보유 및 이용기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>플랫폼 최적화 및 청취 통계</td>
                <td>채널 링크 연결 상태 확인, 실시간 방송 채널별 단순 합산 청취자 수 집계 및 앱 안정성 최적화</td>
                <td>「개인정보 보호법」 제15조제1항제4호 (서비스 제공 및 계약 이행)</td>
                <td>단말기 모델명, OS 버전, 서비스 이용 기록(접속 채널 이력), IP 주소</td>
                <td>비식별 통계 데이터로 즉시 전환되거나 목적 달성 후 즉시 파기</td>
              </tr>
              <tr>
                <td colSpan={5}>
                  ※ 앱 내에서 제공되는 '지역별 라디오 주파수 안내' 및 '지역 자동 선택' 기능은 이용자의 단말기 내 설정을
                  활용할 뿐, {companyName}가 이용자의 위치정보를 서버로 수집하거나 저장하지 않습니다.
                </td>
              </tr>
            </tbody>
          </table>
          <div>② 정보주체의 별도 요청 및 설정을 통해 처리하는 항목 (선택 항목)</div>
          <div>
            이용자가 앱 내 설정에서 재난 알림(문자) 서비스를 명시적으로 활성화하고 요청한 경우에만 아래의 푸시 토큰 및
            실시간 위치 데이터를 처리합니다. 활성화하지 않은 이용자의 경우 해당 정보는 일절 수집·처리되지 않습니다.
          </div>
          <table>
            <thead>
              <tr>
                <th>구분/서비스</th>
                <th>처리 목적</th>
                <th>수집 항목</th>
                <th>보유 및 이용기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>재난 알림 서비스 (이용자 선택 시)</td>
                <td>이용자가 알림을 활성화한 경우, 접속 위치 기준 실시간 국가 재난 알림 필터링 및 푸시 고지</td>
                <td>Cloud Message 푸시 토큰값, 단말기 OS 유형 및 버전, 현재 접속 위치 데이터</td>
                <td>
                  앱 삭제 시 또는 알림 설정 해제 시까지 (단, 위치 데이터는 서버에 절대 저장되지 않으며, 실시간 재난 지역
                  필터링 후 즉시 파기됨)
                </td>
              </tr>
              <tr>
                <td>앱로그 분석 및 맞춤형 광고</td>
                <td>구글 애드몹/애널리틱스를 통한 사용 패턴 분석 및 온라인 맞춤형 광고 제공</td>
                <td>모바일 광고식별자 (ADID / IDFA), 앱 내 클릭 및 시청 이력</td>
                <td>수집일로부터 6개월 보관 후 파기</td>
              </tr>
            </tbody>
          </table>
        </SectionContent>
      </Section>

      <Hr />
      <Section id={2}>
        <SectionTitle item={privacyIndexList[1]} />
        <SectionContent>
          <div>
            {companyName}는 서비스 내에서 구글 애드몹(Google AdMob) 및 구글 애널리틱스(Google Analytics for Firebase)를
            사용하며, 이 과정에서 제3자(구글)가 이용자의 단말기 정보를 자동으로 수집하도록 허용하고 있습니다. 수집되는
            정보는 특정 개인을 식별할 수 없는 행태정보 및 기기 정보입니다.
          </div>
          <div>① 제3자가 수집해가는 행태정보에 관한 사항</div>
          <table>
            <thead>
              <tr>
                <th>수집장치 명칭</th>
                <th>종류 / 수집 도구</th>
                <th>수집해가는 사업자</th>
                <th>수집하는 행태정보 항목</th>
                <th>수집 및 이용 목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google AdMob SDK</td>
                <td>모바일 앱 소프트웨어 개발 키트(SDK)</td>
                <td>Google 인공지능/광고사업부 (Google LLC)</td>
                <td>모바일 광고식별자 (ADID / IDFA), 앱 이용 환경 정보</td>
                <td>서비스 내 이용자 관심사 기반 맞춤형 광고 게재</td>
              </tr>
              <tr>
                <td>Google Analytics SDK</td>
                <td>모바일 앱 소프트웨어 개발 키트(SDK)</td>
                <td>Google 애널리틱스팀 (Google LLC)</td>
                <td>앱 내 클릭 로그, 사용 시간, 화면 흐름 및 전동 기록</td>
                <td>앱 오류 분석, 서비스 이용 행태 통계 및 시스템 성능 개선</td>
              </tr>
            </tbody>
          </table>
          <div>② 행태정보(광고식별자) 수집 거부 및 차단 방법</div>
          <div>
            정보주체는 단말기 설정을 변경함으로써 제3자의 맞춤형 광고 및 행태정보 수집을 일괄적으로 차단할 수 있습니다.
          </div>
          <div>
            안드로이드(Android): 설정 → 보안 및 개인정보 보호 → 개인정보 보호 → 기타 개인정보 설정 → 광고 → 광고 ID 삭제
            또는 재설정
          </div>
          <div>※ 단말기 OS 버전에 따라 설정 메뉴의 진입 경로 및 명칭이 일부 상이할 수 있습니다. </div>
        </SectionContent>
      </Section>

      <Hr />
      <Section id={3}>
        <SectionTitle item={privacyIndexList[2]} />
        <SectionContent>
          <div>
            {companyName}는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이
            해당 개인정보를 파기합니다.
          </div>
          <div>
            파기절차: 앱 삭제 또는 알림 차단 시 수집된 푸시 토큰 등은 파기 대상으로 분류되어 복구 불가능한 방법으로
            안전하게 삭제됩니다.
          </div>
          <div>
            파기방법: 전자적 파일 형태로 저장된 모든 로그 및 단말기 데이터 정보는 기록을 재생할 수 없는 기술적 방법을
            사용하여 영구 삭제합니다.
          </div>
        </SectionContent>
      </Section>
      <Hr />

      <Section id={4}>
        <SectionTitle item={privacyIndexList[3]} />
        <SectionContent>
          <div>
            ① 이용자는 {companyName}에 대해 언제든지 단말기 설정을 통해 개인정보 및 위치정보 수집 거부, 푸시 수신 거부
            등의 권리를 행사할 수 있습니다.
          </div>
          <div>
            ② 권리 행사는 스마트폰 내의 설정 &gt; 애플리케이션 &gt; [앱 이름] 메뉴에서 '알림 권한' 및 '위치 권한'을
            거부(허용 안 함)로 변경함으로써 즉시 적용 가능합니다.
          </div>
          <div>
            ③ {companyName}의 이메일 연락처 등을 통해서도 권리 행사를 요청하실 수 있으며, 회사는 요청을 받은 날로부터
            지체 없이 조치하겠습니다.
          </div>
        </SectionContent>
      </Section>

      <Hr />
      <Section id={5}>
        <SectionTitle item={privacyIndexList[4]} />
        <SectionContent>
          <div>
            {companyName}는 단말기 토큰값 및 무선 접속 데이터의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
          </div>
          <ul>
            <li>관리적 조치: 내부관리계획 수립·시행 및 개인정보 취급 인력의 최소화</li>
            <li>
              기술적 조치: 앱과 분석 서버 간 데이터 전송 시 암호화 통신(HTTPS) 적용, 광고 플랫폼의 보안 가이드라인 준수
            </li>
            <li>물리적 조치: 통계 데이터 및 푸시 토큰 아카이브 관리를 위한 인프라 접근 제어</li>
          </ul>
        </SectionContent>
      </Section>
      <Hr />

      <Section id={6}>
        <SectionTitle item={privacyIndexList[5]} />
        <SectionContent>
          <div>
            회사는 개인정보 관련 문의 및 고충사항을 신속하게 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고
            있습니다.
          </div>
          <div>개인정보 담당자</div>
          <ul>
            <li>담당자: 2ER0</li>
            <li>연락처(이메일): hello@2er0.io</li>
          </ul>
        </SectionContent>
      </Section>
      <Hr />
      <Section id={7}>
        <SectionTitle item={privacyIndexList[6]} />
        <SectionContent>
          <div>
            이용자는 개인정보침해로 인한 구제를 받기 위하여 아래의 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.
          </div>
          <ul>
            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
            <li>경찰청 사이버수사국: (국번없이) 182 (ecrm.police.go.kr)</li>
          </ul>
        </SectionContent>
      </Section>
      <Hr />
      <Section id={8}>
        <SectionTitle item={privacyIndexList[7]} />
        <SectionContent>
          <div>① 이 개인정보 처리방침은 2026년 7월 일부터 적용됩니다.</div>
          <div>② 본 방침이 변경되는 경우 서비스 내 공지사항 화면을 통해 신속하게 고지하겠습니다.</div>
        </SectionContent>
      </Section>
    </>
  );
};
