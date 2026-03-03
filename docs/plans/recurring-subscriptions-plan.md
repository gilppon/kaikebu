# Implementation Plan: Recurring Subscriptions Management (고정 지출 관리)

**Status**: 🔄 In Progress
**Started**: 2026-03-03
**Last Updated**: 2026-03-03

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview
* **Description:** 넷플릭스, 스포티파이, 통신비 등 매월 고정적으로 나가는 지출(구독 서비스)을 따로 관리하고, 이번 달 예상 지출(Prediction)과 가계부에 캘린더와 자동 연동시키는 기능.
* **Success Criteria:**
  - [ ] 사용자가 고정 지출 내역(구독명, 금액, 결제일, 카테고리)을 등록/수정/삭제할 수 있다.
  - [ ] 등록된 고정 지출 내역 합산 금액이 메인 대시보드의 `PredictionCard`에 반영된다.
* **Architecture Decisions:** 전역 상태인 Zustand Store 내에 `subscriptions` slice를 새롭게 도입하여 관심사를 분리하고 기존 로직의 오염을 방지한다.

## 📦 Dependencies
* [ ] Required: Zustand, Jest/Testing-Library (TDD 진행용)
* [ ] External: `dayjs` (결제일 도래 여부 계산용)

## 🧪 Test Strategy
* **TDD Principle:** Write tests FIRST, then implement. (철저한 Red-Green-Refactor)
* **Coverage Target:** Unit ≥ 80%, Integration (Prediction 연동 경로 필수 테스트).
* **Test File Location:** `src/__tests__/store/subscriptionStore.test.ts`, `src/__tests__/components/SubscriptionList.test.tsx`

---

## 🚀 Implementation Phases

### Phase 1: 고정 지출 상태 관리 및 비즈니스 로직 적용 (Foundation/Core Logic)
**Goal:** Zustand 스토어에 구독료 정보를 통제하는 로직을 추가하고 CRUD 기능을 확보한다.

#### Tasks (TDD Cycle)

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: Write unit tests for adding/removing a subscription in the store.
  - File: `src/__tests__/store/subscriptionStore.test.ts`
  - Expectation: Fails (Red) because feature doesn't exist.
- [ ] **Test 1.2**: Write unit tests for calculating the sum of monthly subscriptions.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.3**: Implement `subscriptionSlice` in `src/lib/store.ts` to pass Test 1.1.
- [ ] **Task 1.4**: Implement calculating logic to pass Test 1.2.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.5**: Refactor variable names and organize actions without breaking tests.

#### Quality Gate ✋ (STOP & CHECK)
**⚠️ Do NOT proceed until ALL checks pass**

- [ ] **Build & Compilation**: 🏗️ Project builds without errors?
- [ ] **TDD Compliance**: 🚦 Tests written BEFORE code? (Red -> Green)
- [ ] **Test Coverage**: 🧪 All tests pass (100%) & Logic coverage ≥ 80%?
- [ ] **Code Quality**: 🧹 Linting clean? Type checks pass?
- [ ] **Security Check**: 🛡️ SQLi/XSS check, No hardcoded secrets, `npm audit` pass?
- [ ] **Manual Verification**: ✅ Feature works as expected in browser/app (Store 레벨 콘솔 검증)?

---

### Phase 2: UI 컴포넌트 시각화 및 기존 로직 통합 (Business Logic/Integration)
**Goal:** 고정 지출 관리 UI 컴포넌트를 만들고 기존 `PredictionCard`에 구독료를 합산하여 보여준다.

#### Tasks (TDD Cycle)

**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: Write simple render string matches component test for `SubscriptionModal` logic.
- [ ] **Test 2.2**: Write integration test where `PredictionCard` correctly renders combined totals including sub fees.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.3**: Implement `src/components/SubscriptionModal.tsx`.
- [ ] **Task 2.4**: Update `src/components/PredictionCard.tsx` to pull and sum sub fees from the store.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 2.5**: Refactor styling with Mantine UI patterns to ensure a premium look.

#### Quality Gate ✋ (STOP & CHECK)
- [ ] **Build & Compilation**: 🏗️ Build Success
- [ ] **TDD Compliance**: 🚦 Red-Green-Refactor followed
- [ ] **Test Coverage**: 🧪 Tests Pass & Coverage met
- [ ] **Code Quality**: 🧹 Lint & Types OK
- [ ] **Security Check**: 🛡️ No Vulnerabilities
- [ ] **Manual Verification**: ✅ Functional Check (화면에서 추가 시 예상액 연동 확인)

---

## ⚠️ Risk & Rollback
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 로직 결합도 상승 | Low | Med | Zustand 분할 처리(Slice)를 통해 기존 기능과 강결합 방지 |
| 달력/날짜 오차 | Med | High | `dayjs`를 적극 이용한 timezone 및 leap year 테스트 검증 수행 |

**Rollback Strategy:**
* If Phase 1 fails: Revert store additions.
* If Phase 2 fails: Feature Toggle(Comment Out) for Subscription UI and Prediction modification.

## 📝 Notes & Learnings
* [Log issues, blockers, or insights here]

---

## 📏 Quality Gate Standards (품질 검문소 세부 기준)
**각 Phase 종료 시, 아래 기준을 하나라도 만족하지 못하면 다음 단계로 진행할 수 없습니다.**

1.  **빌드 & 컴파일 (Build & Compilation):** 에러(Error) 0개 필수.
2.  **TDD 준수 (TDD Compliance):** 테스트 코드(Red)가 먼저 작성된 후 커밋.
3.  **테스트 커버리지 (Test Coverage):** Unit 80% 이상, 실패 0건.
4.  **코드 품질 (Code Quality):** Lint 및 Type 에러 0건.
5.  **보안 (Security):** `npm audit` 취약점 0개 점검.
6.  **기능성 (Functionality):** 회귀(Regression) 및 동작 오류 배제.
