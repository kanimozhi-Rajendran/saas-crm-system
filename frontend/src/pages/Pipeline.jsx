import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { dealsAPI } from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const Pipeline = () => {
  const [deals, setDeals] = useState({});
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data } = await dealsAPI.getAll();
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = data.data.filter(d => d.stage === stage);
        return acc;
      }, {});
      setDeals(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    
    // Optistic update
    const newDeals = { ...deals };
    const movedDeal = newDeals[sourceStage].find(d => d._id === draggableId);
    
    newDeals[sourceStage] = newDeals[sourceStage].filter(d => d._id !== draggableId);
    movedDeal.stage = destStage;
    newDeals[destStage] = [
      ...newDeals[destStage].slice(0, destination.index),
      movedDeal,
      ...newDeals[destStage].slice(destination.index)
    ];
    setDeals(newDeals);

    try {
      const { data } = await dealsAPI.update(draggableId, { stage: destStage });
      // Replace optimistically updated deal with API response to get recalculated AI stats
      setDeals(prev => {
        const next = { ...prev };
        const index = next[destStage].findIndex(d => d._id === draggableId);
        if (index > -1 && data.data) {
          next[destStage][index] = data.data; // assuming API returns { success: true, ai: {...}, data: updatedDeal } or similar
          // Need to fetch fresh deals to be safe if that's not the exact structure
        }
        return next;
      });
      fetchDeals(); // Re-fetch to ensure consistency and grab new AI stats
    } catch (err) {
      console.error("Failed to update deal stage", err);
      fetchDeals(); // Revert on failure
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Prospecting": return colors.muted;
      case "Qualification": return colors.accent;
      case "Proposal": return colors.purple;
      case "Negotiation": return colors.amber;
      case "Closed Won": return colors.green;
      case "Closed Lost": return colors.red;
      default: return colors.muted;
    }
  };

  if (loading) return <div style={{ color: colors.accent, padding: "2rem" }}>Loading Pipeline...</div>;

  return (
    <div style={{ color: colors.text, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>🗂️ Kanban Pipeline</h2>
        <p style={{ color: colors.muted, fontSize: "0.85rem" }}>Drag and drop deals across stages. AI probabilities recalculate automatically.</p>
      </div>

      <div style={{ flex: 1, overflowX: "auto", paddingBottom: "1rem" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: "1rem", height: "100%", minHeight: "60xh" }}>
            {STAGES.map((stage) => {
              const stageDeals = deals[stage] || [];
              const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
              const color = getStageColor(stage);

              return (
                <div key={stage} style={{ 
                  flex: "0 0 320px", background: colors.surface, 
                  borderRadius: "12px", border: `1px solid ${colors.border}`,
                  display: "flex", flexDirection: "column", height: "100%"
                }}>
                  <div style={{ padding: "1rem", borderBottom: `2px solid ${color}`, background: `rgba(${color === colors.bg ? "255,255,255" : "var(--tw-empty)"}, 0.05)` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: colors.text }}>{stage}</h3>
                      <span style={{ background: `${color}22`, color: color, padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: colors.muted, marginTop: "0.3rem", fontWeight: 500 }}>
                      ${(totalValue / 1000).toFixed(1)}k
                    </div>
                  </div>

                  <Droppable droppableId={stage}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ padding: "0.8rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.8rem", minHeight: "150px" }}
                      >
                        {stageDeals.map((deal, index) => {
                          const probColor = deal.dealProbability >= 75 ? colors.green : deal.dealProbability >= 50 ? colors.amber : colors.red;
                          
                          return (
                            <Draggable key={deal._id} draggableId={deal._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    background: colors.bg,
                                    border: `1px solid ${snapshot.isDragging ? colors.accent : colors.border}`,
                                    borderRadius: "8px", padding: "1rem",
                                    boxShadow: snapshot.isDragging ? `0 4px 12px rgba(0,0,0,0.5)` : "none",
                                    position: "relative",
                                    overflow: "hidden"
                                  }}
                                >
                                  {/* Top accent line based on probability */}
                                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: probColor }} />
                                  
                                  <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.3rem", color: colors.text }}>
                                    {deal.title}
                                  </div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: colors.accent, marginBottom: "0.8rem" }}>
                                    ${(deal.value || 0).toLocaleString()}
                                  </div>
                                  
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: colors.muted, marginBottom: "0.3rem" }}>
                                    <span>AI Close Prob.</span>
                                    <span style={{ fontWeight: 700, color: probColor }}>{deal.dealProbability}%</span>
                                  </div>
                                  <div style={{ width: "100%", height: "4px", background: colors.border, borderRadius: "2px", overflow: "hidden", marginBottom: "0.8rem" }}>
                                    <div style={{ width: `${deal.dealProbability}%`, height: "100%", background: probColor }} />
                                  </div>
                                  
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "0.7rem", color: colors.muted, background: colors.surface, padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                      {deal.daysInPipeline} days aged
                                    </div>
                                    <div style={{ display: "flex", gap: "0.3rem", fontSize: "0.8rem" }}>
                                      <span title={deal.hasBudgetConfirmed ? "Budget Confirmed" : "No Budget"}>{deal.hasBudgetConfirmed ? "💰" : "🚫"}</span>
                                      <span title={deal.hasChampion ? "Has Champion" : "No Champion"}>{deal.hasChampion ? "⭐" : "🚫"}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Pipeline;
