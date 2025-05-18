import TaskManager from "@/components/task-manager"

export default function Home() {
  return (
    <main className="w-full max-w-[1200px] mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold text-primary-700 mb-4">Task Taker</h2>
        <div className="flex gap-3 flex-wrap mt-2">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">Resource Management</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Task Tracking</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Timeline Planning</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Cost Analysis</span>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700 mb-2">Project Management Dashboard</h1>
        <p className="text-gray-600">Manage tasks, resources, and timelines efficiently</p>
      </header>

      <TaskManager />
    </main>
  )
}
