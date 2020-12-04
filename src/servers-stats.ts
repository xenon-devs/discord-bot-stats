import { Client } from 'discord.js';

export type RegionStats = {
  totalServers: number,
  totalUsers: number,
  averageUsersPerServer: number,
  percentageServers: number,
  percentageUsers: number
}

export type RegionWiseStats = {
  [region: string]: RegionStats
}

export type ServerMemberStats = {
  moreThan100MemberServers: number,
  moreThan100MemberServersPercentage: number,
  moreThan100MemberServerUsers: number,
  moreThan100MemberServerUsersPercentage: number,
  moreThan1000MemberServers: number,
  moreThan1000MemberServersPercentage: number,
  moreThan1000MemberServerUsers: number,
  moreThan1000MemberServerUsersPercentage: number
}

export type Stats = {
  totalServers: number,
  totalUsers: number,
  regionWiseStats: RegionWiseStats,
  serverMemberStats: ServerMemberStats
}

const getPercentage = (numerator: number, denominator: number) => Math.floor(10000 * numerator / denominator) / 100; // Two decimals

export function getServersStats(
  client: Client,
  cb: (stats: Stats) => void
) {
  client.on('ready', () => {
    const serversInfo: [string, number][] = client.guilds.cache.array().map(server => [server.region, server.memberCount]);// [region, memberCount]

    let moreThan100MemberServers = 0; // Servers with more than 100 members
    let moreThan100MemberServerUsers = 0; // Users in servers with more than 100 members
    let moreThan1000MemberServers = 0;
    let moreThan1000MemberServerUsers = 0;
    let totalServers = serversInfo.length;
    let totalUsers = 0;

    const regionWiseStats: RegionWiseStats = {};

    serversInfo.forEach(([region, memberCount]) => {
      totalUsers += memberCount;

      if (memberCount >= 100) {
        moreThan100MemberServers++;
        moreThan100MemberServerUsers += memberCount;

        if (memberCount >= 1000) {
          moreThan1000MemberServers++;
          moreThan1000MemberServerUsers += memberCount;
        }
      }

      if(!regionWiseStats[region]) {
        regionWiseStats[region] = {
          totalServers: 1,
          totalUsers: memberCount,
          averageUsersPerServer: 0,
          percentageServers: 0,
          percentageUsers: 0
        }
      }
      else {
        regionWiseStats[region].totalServers++;
        regionWiseStats[region].totalUsers += memberCount;
      }
    })

    for (let region in regionWiseStats) {
      const regionStats = regionWiseStats[region];

      regionWiseStats[region].averageUsersPerServer = regionStats.totalUsers / regionStats.totalUsers;

      regionWiseStats[region].percentageUsers = getPercentage(regionStats.totalUsers, totalUsers);
      regionWiseStats[region].percentageServers = getPercentage(regionStats.totalServers, totalServers);
    }

    const moreThan100MemberServersPercentage = getPercentage(moreThan100MemberServers, totalServers);
    const moreThan100MemberServerUsersPercentage = getPercentage(moreThan100MemberServerUsers, totalUsers);

    const moreThan1000MemberServersPercentage = getPercentage(moreThan1000MemberServers, totalServers);
    const moreThan1000MemberServerUsersPercentage = getPercentage(moreThan1000MemberServerUsers, totalUsers);

    if (cb) cb({
      totalServers,
      totalUsers,
      regionWiseStats,
      serverMemberStats: {
        moreThan100MemberServers,
        moreThan100MemberServersPercentage,
        moreThan100MemberServerUsers,
        moreThan100MemberServerUsersPercentage,
        moreThan1000MemberServers,
        moreThan1000MemberServersPercentage,
        moreThan1000MemberServerUsers,
        moreThan1000MemberServerUsersPercentage
      }
    })
  })
}
