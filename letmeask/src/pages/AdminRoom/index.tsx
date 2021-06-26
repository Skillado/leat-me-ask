import { Button } from '../../components/Button/Button';
import { RoomCode } from '../../components/RoomCode';
import { useHistory, useParams } from 'react-router-dom';

import { FormEvent, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { database } from '../../services/firebase';

import './styles.scss';
import logoImg from '../../assets/images/logo.svg';
import deleteImg from '../../assets/images/delete.svg';


import { Question } from '../../components/Question';
import { useRoom } from '../../hooks/useRoom';

type RoomParams = {
    id:string;
}


export function AdminRoom(){
    const {user} = useAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const roomId = params.id;
    const history = useHistory();

    const { title, questions} = useRoom(roomId);


    async function handleEndRoom(){
        await database.ref(`rooms/${roomId}`).update({
            endedAt: new Date(),
        });


        history.push('/');
    }

    async function handleDeleteQuestion(questionId: string)
    {
        if (window.confirm("Tem certeza que você deseja excluir esta pergunta?")){
           return await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        }
    }

    async function handleSendQuestion(event:FormEvent){

        event.preventDefault();
        if(newQuestion.trim() ==='')
        {
            return;
        }

        if(!user){
            throw new Error('You most be logged in')
        }

        const question = {
            content: newQuestion,
            author:{
                name:user.name,
                avatar: user.avatar,
            },
            isHighligthed:false,
            isAnswered:false
        };

        setNewQuestion('');

        await database.ref(`rooms/${roomId}/questions`).push(question)
    }
    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined onClick={handleEndRoom}> Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {
                     questions.length > 0 && (<span> {questions.length} pergunta(s)</span>)
                    }
                    
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                       placeholder="O que você quer perguntar?"
                       onChange={event=> setNewQuestion(event.target.value)}
                       value={newQuestion}
                    /> 
                    <div className="form-footer">
                    {
                        user? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ):(
                            <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
                          )
                    }
                        <Button type="submit" > Enviar pergunta </Button>
                    </div>
                </form>
               <div className="question-list">
                {questions.map(question=>{
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                            >

                                <button
                                    type="button"
                                    onClick={()=>handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta" />

                                </button>

                            </Question>
                        )
                    })}
               </div>
            </main>
        </div>
    );
}