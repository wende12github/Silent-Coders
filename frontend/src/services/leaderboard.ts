import axios from 'axios';

export const fetchLeaderboard=async(page:number=1,limit:number=10)=>{
    const response=await axios.get('http://127.0.0.1:8000/leaderboard/',{
        params:{
            page:page,
            limit: limit,
        },
    })
    return response.data;
}