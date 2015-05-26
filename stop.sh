ps -ef|awk 'BEGIN{}{if(match($8, /python/))system("kill -9 " $2)}END{}'
