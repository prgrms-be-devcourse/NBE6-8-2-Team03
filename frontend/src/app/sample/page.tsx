// src/app/sample/page.tsx
import TodoListTemplate from "../components/TodoList/TodoListTemplate";

export default function SamplePage() {
  return (
    <TodoListTemplate>
      <div>
        <h1>샘플 페이지 메인 콘텐츠</h1>
        <h1>요기서 작성하면 됩니다</h1>
      </div>
    </TodoListTemplate>
  );
}