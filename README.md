# devcourse-NBE6-8-2-Team03
NBE6-8-2-Team03 사이보이즈
### branch 규칙

태그 종류

- `feature`: 새로운 기능 추가 (feature)
- `fix`: 버그 수정
- `chore`: 코드 변경이 아닌 빌드, 설정, 문서 수정 등 잡일성 작업
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 코드 스타일 관련 변경
- `refactor`: 리팩토링 (기능 변화 없이 코드 구조 개선)
- `test`: 테스트 추가/수정
- `perf`: 성능 개선

[기술 분야] / [작업 종류] / [이슈넘버]-[구현 기능]

Ex)   `be/feature/1-login`

여기서 이슈 넘버는 **git issue** 등록 시 나오는 숫자로 한다

<img width="995" height="421" alt="image (4)" src="https://github.com/user-attachments/assets/80ed17b7-7218-4241-8df9-35c00a3aa7bf" />


### commit 규칙

앞에 [BE], [FE] 로 구분해주기

```bash
//[**본인 영역**] **commit 종류** : commit 내용

**[FE] feature: 로그인 화면 추가**   //front 영역 feat(새 기능 추가)에서 로그인 기능 추가

**[BE] fix :f**                   //backend 영역 fix(버그 수정)에서 버그를 수정함

//터미널 명령어 예시
git commit -m “[FE] feat: 로그인 화면 추가”
```

### **협업규칙**

1. 작업 전, Issues에 자신의 작업을 등록해주세요. 백엔드 작업의 경우 -> [BE] 이슈이름
2. 작업은 main 브랜치가 아닌 작업용 브랜치를 따로 만들어서 진행해주세요.
3. 작업 진행중 커밋을 진행시, 아래의 Commit Message Convention을 참고하여 진행해주세요.
4. 작업에서 하나의 커밋 진행 후, `git pull origin main --rebase`를 통해 작업 브랜치의 최신화를 유지해주세요.
5. 작업이 끝나면 해당 작업을 브랜치에 push 후 main branch와 Squash merge 해주세요.
6. merge 후에는 브런치를 삭제해주시고, `git fetch --prune`을 통해 로컬에 남아있는 원격 레포지토리를 정리해주세요.

### PR 규칙

1. 기본적으로 구현할 때마다 새 branch 생성 후, 작성하기
2. `main` branch에는 해당 기능 구현 완료되었을 때만 pr을 통한 병합 요청
3. pr을 단순히 코드리뷰 용으로 사용할 경우 `draft pull request 사용`(reviewer가 확인해도 병합 안되니 마음 편히 사용가능)

### 어노테이션 규칙

저희 어노테이션 작성할 때 배치 순서에 대해서 간략하게 얘기하자면 일단 가장 기본적인 틀은 아래 규칙을 지켜주세요

어노테이션 배치 관례 (클래스 레벨)

1. Lombok 어노테이션: @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder 등은 클래스 전체에 영향을 주므로 가장 먼저(맨 위) 작성
2. Spring/Framework 어노테이션: @Component, @Service, @Controller, @RestController 등이 있다면 Lombok 어노테이션 바로 아래에 배치
3. JPA Entity 어노테이션: @Entity, @Table 등은 Lombok, Spring/Framework 다음에 배치
4. 공통 설정 어노테이션: 주로 @RequestMapping처럼 특정 기능에 대한 공통 경로를 지정하는 어노테이션을 둡니다.
5. 문서화/메타데이터 어노테이션: Swagger/OpenAPI의 @Ta...
