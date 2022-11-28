import { Box, useToast, FlatList, VStack } from "native-base";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Game, GameProps } from "./Game";
import { Loading } from "./Loading";
import { EmptyRakingList } from "./EmptyRankingList";
import { MiniCard } from "./MiniCard";
import { useNavigation } from "@react-navigation/native";
import { Header } from "../components/Header";

interface Props {
  poolId: string;
  code: string;
}

export function RankCard({ poolId, code }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const { navigate } = useNavigation();
  const [rank, setRanking] = useState([]);

  const toast = useToast();

  async function fetchRanking() {
    try {
      setIsLoading(true);

      const response = await api.get(`/guesses/results/${poolId}`);

      setInfo(response.data.guesses);
    } catch (error) {
      console.log(error);
      toast.show({
        title: "Ainda não foram realizados palpites nesse bolão.",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function validatePoints(info) {
    console.log(info);
    const points = 0;
    let rankingData;
    rankingData = info.map(function (data) {
      console.log(new Date().getTime());
      if (new Date(data.game.date).getTime() <= new Date().getTime())
        if (
          data.firstTeamPoints === data.game.resultFirstTeamPoints &&
          data.secondTeamPoints === data.game.resultSecondTeamPoints
        ) {
          console.log("PLACAR COMPLETO");
          return { data, pontuacao: points + 4 };
        } else if (
          data.firstTeamPoints > data.secondTeamPoints &&
          data.game.resultFirstTeamPoints > data.game.resultSecondTeamPoints
        ) {
          console.log("ACERTOU GANHADOR");
          return { data, pontuacao: points + 2 };
        } else if (
          data.firstTeamPoints === data.secondTeamPoints &&
          data.game.resultFirstTeamPoints ===
            data.game.resultSecondTeamPoints &&
          data.game.resultFirstTeamPoints !== -1 &&
          data.game.resultSecondTeamPoints !== -1
        ) {
          console.log("ACERTOU GANHADOR");
          return { data, pontuacao: points + 1 };
        } else {
          console.log("Errou");
          return { data, pontuacao: points };
        }
      else {
        console.log("Errou");
        return { data, pontuacao: points };
      }
    });

    console.log(rankingData);

    let rankingPosition = rankingData.reduce(function (
      totalPontos,
      dado,
      index
    ) {
      if (totalPontos[dado.data.participantId]) {
        totalPontos[dado.data.participantId].points += dado.pontuacao;
      } else {
        totalPontos[dado.data.participantId] = {
          participantId: dado.data.participantId,
          name: dado.data.participant.user.name,
          avatarUrl: dado.data.participant.user.avatarUrl,
          points: dado.pontuacao,
        };
      }
      return totalPontos;
    },
    {});

    setRanking(Object.values(rankingPosition));
  }

  useEffect(() => {
    fetchRanking();
  }, [poolId]);
  useEffect(() => {
    validatePoints(info);
  }, [info]);
  rank.sort();
  rank.reverse();

  return (
    <VStack flex={1} bgColor="gray.900">
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={rank}
          keyExtractor={(item) => item.participantId}
          renderItem={({ item, index }) => (
            <MiniCard key={item.participantId} data={item} position={index} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <EmptyRakingList />}
          _contentContainerStyle={{ pb: 10 }}
          px={5}
        />
      )}
    </VStack>
  );
}
