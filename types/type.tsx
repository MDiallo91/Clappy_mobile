//type travailleur
export interface Utilisateur{
    id:string,
    prenom:string,
    nom:string,
    telephone:string,
    adresse:string,
    email:string,
    code:any,
   
}

export interface Course {
  id: number;
  client: string;
  type_vehicule: string;
  adresse_depart: string;
  adresse_arrivee: string;
  date_creation: string;
  statut?: string;
}

export interface NotificationData {
  type: string;
  message: string;
  course: Course;
}

export interface WebSocketMessage {
  type: string;
  course?: Course;
  course_id?: number;
  push_token?: string;
  vehicle_type?: string;
}
