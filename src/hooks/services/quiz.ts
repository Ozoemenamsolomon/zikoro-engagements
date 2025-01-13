"use client"

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient()
export const useRealtimePresence = (isLive: boolean) => {
    useEffect(() => {
      if (isLive) {
        const channel = supabase.channel("live-quiz");
  
        channel
          .on("presence", { event: "sync" }, () => {
            const newState = channel.presenceState();
            // console.log("sync", newState);
            for (let id in newState) {
              //  console.log(newState[id][0])
            }
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            console.log("join", key, newPresences);
           
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            // console.log("leave", key, leftPresences);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await channel.track({
                online_at: new Date().toISOString(),
              });
            }
          });
  
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [supabase, isLive]);
  
    useEffect(() => {
      if (isLive) {
        const channel = supabase.channel("live-players");
  
        channel
          .on("presence", { event: "sync" }, () => {
            const newState = channel.presenceState();
            // console.log("sync", newState);
            for (let id in newState) {
              //  console.log(newState[id][0])
            }
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            // console.log("join", key, newPresences);
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            // console.log("leave", key, leftPresences);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await channel.track({
                online_at: new Date().toISOString(),
              });
            }
          });
  
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [supabase, isLive]);
  
    useEffect(() => {
      if (isLive) {
        const channel = supabase.channel("live-answer");
  
        channel
          .on("presence", { event: "sync" }, () => {
            const newState = channel.presenceState();
            // console.log("sync", newState);
            for (let id in newState) {
              //  console.log(newState[id][0])
            }
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            // console.log("join", key, newPresences);
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            // console.log("leave", key, leftPresences);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await channel.track({
                online_at: new Date().toISOString(),
              });
            }
          });
  
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [supabase, isLive]);
  };