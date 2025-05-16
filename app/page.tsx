import TaskManager from "@/components/task-manager"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Task Management Dashboard</h1>
      <TaskManager />
    </main>
  )
}
