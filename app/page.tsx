"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Edit, Trash2, TrendingUp, Award, Clock, Plus } from "lucide-react"

export default function BettingApp() {
  const [bets, setBets] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bets")
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  const [form, setForm] = useState({
    date: "",
    event: "",
    stake: "",
    odds: "",
    result: "",
  })

  const [deleteMode, setDeleteMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingBetId, setEditingBetId] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [interestingOdds, setInterestingOdds] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("interestingOdds")
      return stored || ""
    }
    return ""
  })

  useEffect(() => {
    localStorage.setItem("bets", JSON.stringify(bets))
  }, [bets])

  useEffect(() => {
    localStorage.setItem("interestingOdds", interestingOdds)
  }, [interestingOdds])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingBetId) {
      setBets(bets.map((b) => (b.id === editingBetId ? { ...b, ...form } : b)))
      setEditingBetId(null)
      setEditMode(false)
    } else {
      setBets([...bets, { id: uuidv4(), ...form }])
    }

    setForm({ date: "", event: "", stake: "", odds: "", result: "" })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setBets(bets.filter((bet) => bet.id !== id))
  }

  const getProfitData = () => {
    let profit = 0
    const dailyProfit: Record<string, number> = {}

    bets
      .filter((b) => b.result !== "pending")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((b) => {
        const d = new Date(b.date)
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
        const stake = Number.parseFloat(b.stake)
        const odds = Number.parseFloat(b.odds)
        let gain = 0

        if (b.result === "win") gain = stake * odds - stake
        if (b.result === "lose") gain = -stake

        dailyProfit[label] = (dailyProfit[label] || 0) + gain
      })

    const result = []
    Object.entries(dailyProfit).forEach(([date, daily]) => {
      profit += daily
      result.push({ date, profit: Number.parseFloat(profit.toFixed(2)) })
    })

    return result
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  const totalBets = bets.length
  const winBets = bets.filter((b) => b.result === "win").length
  const loseBets = bets.filter((b) => b.result === "lose").length
  const pendingBets = bets.filter((b) => b.result === "pending").length

  const totalStake = bets.reduce((acc, b) => acc + Number.parseFloat(b.stake || 0), 0)
  const netProfit = bets.reduce((acc, b) => {
    if (b.result === "win")
      return acc + (Number.parseFloat(b.stake) * Number.parseFloat(b.odds) - Number.parseFloat(b.stake))
    if (b.result === "lose") return acc - Number.parseFloat(b.stake)
    return acc
  }, 0)

  const winRate = totalBets > 0 ? ((winBets / (winBets + loseBets)) * 100).toFixed(1) : "0"

  return (
    <div className="max-w-md mx-auto pb-20 px-2">
      <header className="sticky top-0 z-10 bg-black py-4 mb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-center">LSV PRONO</h1>

        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            <span className="text-green-500 font-medium">{netProfit.toFixed(2)}€</span>
            <span className="text-gray-400 text-xs ml-1">({winRate}% de réussite)</span>
          </div>

          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-blue-600 hover:bg-blue-700">
            {showForm ? (
              "Fermer"
            ) : (
              <>
                <Plus size={16} className="mr-1" /> Nouveau
              </>
            )}
          </Button>
        </div>
      </header>

      {showForm && (
        <Card className="mb-6 border-gray-800 bg-gray-900">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date</label>
                  <Input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Événement</label>
                  <Input
                    name="event"
                    placeholder="PSG-OM..."
                    value={form.event}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mise (€)</label>
                  <Input
                    name="stake"
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    value={form.stake}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cote</label>
                  <Input
                    name="odds"
                    type="number"
                    step="0.01"
                    placeholder="1.85"
                    value={form.odds}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Résultat</label>
                <Select value={form.result} onValueChange={(value) => handleSelectChange("result", value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Sélectionner un résultat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Gagné</SelectItem>
                    <SelectItem value="lose">Perdu</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingBetId ? "Modifier" : "Ajouter"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingBetId(null)
                    setForm({ date: "", event: "", stake: "", odds: "", result: "" })
                  }}
                  className="border-gray-700 text-gray-300"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="grid grid-cols-4 bg-gray-900">
          <TabsTrigger value="all">
            Tous
            <span className="ml-1 text-xs bg-gray-800 px-1.5 rounded-full">{totalBets}</span>
          </TabsTrigger>
          <TabsTrigger value="win">
            <Check size={14} className="mr-1" />
            <span className="mr-1">Gagnés</span>
            <span className="text-xs bg-gray-800 px-1.5 rounded-full">{winBets}</span>
          </TabsTrigger>
          <TabsTrigger value="lose">
            <span className="mr-1">Perdus</span>
            <span className="text-xs bg-gray-800 px-1.5 rounded-full">{loseBets}</span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock size={14} className="mr-1" />
            <span className="text-xs bg-gray-800 px-1.5 rounded-full">{pendingBets}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {deleteMode && (
        <div className="bg-red-900/50 text-white text-center p-2 mb-4 rounded-lg border border-red-700">
          <Trash2 className="inline-block mr-2" size={16} />
          Appuyez sur un pari pour le supprimer
        </div>
      )}

      {editMode && (
        <div className="bg-amber-900/50 text-white text-center p-2 mb-4 rounded-lg border border-amber-700">
          <Edit className="inline-block mr-2" size={16} />
          Sélectionnez un pari à modifier
        </div>
      )}

      <div className="space-y-3 mb-6">
        {bets.filter((b) => filter === "all" || b.result === filter).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun pari{" "}
            {filter === "win" ? "gagné" : filter === "lose" ? "perdu" : filter === "pending" ? "en attente" : ""} à
            afficher
          </div>
        ) : (
          bets
            .filter((b) => filter === "all" || b.result === filter)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((bet) => {
              const resultColor =
                bet.result === "win"
                  ? "bg-green-900/30 border-green-800"
                  : bet.result === "lose"
                    ? "bg-red-900/30 border-red-800"
                    : "bg-gray-800/50 border-gray-700"

              const resultIcon =
                bet.result === "win" ? (
                  <Award size={16} className="text-green-400" />
                ) : bet.result === "lose" ? (
                  <span className="text-red-400">✗</span>
                ) : (
                  <Clock size={16} className="text-gray-400" />
                )

              const profit =
                bet.result === "win"
                  ? Number.parseFloat(bet.stake) * Number.parseFloat(bet.odds) - Number.parseFloat(bet.stake)
                  : bet.result === "lose"
                    ? -Number.parseFloat(bet.stake)
                    : null

              return (
                <Card
                  key={bet.id}
                  className={`${resultColor} border transition-all ${deleteMode || editMode ? "cursor-pointer active:scale-95" : ""}`}
                  onClick={() => {
                    if (deleteMode) handleDelete(bet.id)
                    else if (editMode) {
                      setEditingBetId(bet.id)
                      setForm({
                        date: bet.date,
                        event: bet.event,
                        stake: bet.stake,
                        odds: bet.odds,
                        result: bet.result,
                      })
                      setShowForm(true)
                      setEditMode(false)
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{bet.event}</div>
                        <div className="text-xs text-gray-400">{formatDate(bet.date)}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                          {resultIcon}
                          <span className="text-sm font-medium">
                            {bet.result === "win"
                              ? `+${profit?.toFixed(2)}€`
                              : bet.result === "lose"
                                ? `-${bet.stake}€`
                                : "En attente"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Mise: {bet.stake}€ | Cote: {bet.odds}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
        )}
      </div>

      {bets.length > 0 && (
        <>
          <Card className="mb-6 border-gray-800 bg-gray-900">
            <CardContent className="p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Statistiques
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Mise totale</div>
                  <div className="font-bold text-lg">{totalStake.toFixed(2)}€</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Gain net</div>
                  <div className={`font-bold text-lg ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {netProfit.toFixed(2)}€
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 p-2 rounded-lg text-center">
                  <div className="text-green-400 font-bold">{winBets}</div>
                  <div className="text-xs text-gray-400">Gagnés</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg text-center">
                  <div className="text-red-400 font-bold">{loseBets}</div>
                  <div className="text-xs text-gray-400">Perdus</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg text-center">
                  <div className="text-gray-300 font-bold">{winRate}%</div>
                  <div className="text-xs text-gray-400">Réussite</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {getProfitData().length > 0 && (
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-4">
                <h2 className="font-bold mb-3">Évolution des gains</h2>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getProfitData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#aaa" }} axisLine={{ stroke: "#333" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#aaa" }} axisLine={{ stroke: "#333" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#222",
                          border: "1px solid #444",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "#aaa" }}
                        itemStyle={{ color: "#3b82f6" }}
                        formatter={(value: number) => [`${value}€`, "Gain net"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#3b82f6" }}
                        activeDot={{ r: 5, fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="mb-20 border-gray-800 bg-gray-900">
        <CardContent className="p-4">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-yellow-400" />
            Cotes Intéressantes
          </h2>
          <textarea
            value={interestingOdds}
            onChange={(e) => setInterestingOdds(e.target.value)}
            placeholder="Notez ici les cotes intéressantes que vous repérez...&#10;&#10;Exemple:&#10;PSG vs OM - Victoire PSG @1.85&#10;Real vs Barca - Plus de 2.5 buts @2.10"
            className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
          />
          <div className="text-xs text-gray-400 mt-2">
            💡 Utilisez cette zone pour noter rapidement les opportunités de paris que vous repérez
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2">
        <div className="max-w-md mx-auto flex gap-2">
          <Button
            variant={deleteMode ? "destructive" : "outline"}
            className={`flex-1 ${!deleteMode && "border-gray-700 text-gray-300"}`}
            onClick={() => {
              setDeleteMode(!deleteMode)
              setEditMode(false)
            }}
          >
            <Trash2 size={16} className="mr-1" />
            {deleteMode ? "Annuler" : "Supprimer"}
          </Button>

          <Button
            variant={editMode ? "default" : "outline"}
            className={`flex-1 ${editMode ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700 text-gray-300"}`}
            onClick={() => {
              setEditMode(!editMode)
              setDeleteMode(false)
            }}
          >
            <Edit size={16} className="mr-1" />
            {editMode ? "Annuler" : "Modifier"}
          </Button>
        </div>
      </div>
    </div>
  )
}
